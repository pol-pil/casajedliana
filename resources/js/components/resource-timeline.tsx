import React, { useMemo, useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

function useDarkMode(): boolean {
	const [dark, setDark] = useState(() => typeof window !== 'undefined' && document.documentElement.classList.contains('dark'));
	useEffect(() => {
		const observer = new MutationObserver(() => {
			setDark(document.documentElement.classList.contains('dark'));
		});
		observer.observe(document.documentElement, { attributeFilter: ['class'] });
		return () => observer.disconnect();
	}, []);
	return dark;
}

type Resource = {
	id: string;
	title: string;
	roomType?: string;
};

type CalendarEvent = {
	id: string;
	resourceId: string;
	title: string;
	start: string;
	end: string;
	backgroundColor?: string;
	borderColor?: string;
	extendedProps?: Record<string, unknown>;
};

type EventContentProps = {
	event: CalendarEvent;
};

type ResourceTimelineProps = {
	resources: Resource[];
	events: CalendarEvent[];
	eventContent?: (props: EventContentProps) => React.ReactNode;
	onEventClick?: (event: CalendarEvent) => void;
	initialView?: 'day' | 'week' | 'month';
};

type LanedEvent = {
	event: CalendarEvent;
	lane: number;
	totalLanes: number;
	left: number;
	width: number;
};

const RESOURCE_COL_WIDTH = 130;
const LANE_HEIGHT = 36;
const LANE_GAP = 4;
const ROW_PADDING = 6;
const MIN_ROW_HEIGHT = LANE_HEIGHT + ROW_PADDING * 2;
const HEADER_HEIGHT = 52;

// ── Date helpers ──────────────────────────────────────────────────────────────

function startOfDay(date: Date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

function addDays(date: Date, n: number) {
	const d = new Date(date);
	d.setDate(d.getDate() + n);
	return d;
}

function startOfWeek(date: Date) {
	const d = new Date(date);
	d.setDate(d.getDate() - d.getDay());
	d.setHours(0, 0, 0, 0);
	return d;
}

function startOfMonth(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

function daysInRange(start: Date, end: Date) {
	const days: Date[] = [];
	let cur = startOfDay(start);
	const endDay = startOfDay(end);
	while (cur <= endDay) {
		days.push(new Date(cur));
		cur = addDays(cur, 1);
	}
	return days;
}

function isToday(date: Date) {
	const t = new Date();
	return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
}

function formatRangeTitle(view: 'day' | 'week' | 'month', anchor: Date, days: Date[]) {
	if (view === 'day') {
		return anchor.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		});
	}
	if (view === 'week') {
		return `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
	}
	return anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatSlotLabel(date: Date, view: 'day' | 'week' | 'month') {
	if (view === 'day') return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
	if (view === 'month') return date.toLocaleDateString('en-US', { day: 'numeric' });
	return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
}

// ── Lane assignment ───────────────────────────────────────────────────────────
//
// Sort events by start time, then greedily assign each to the lowest lane
// whose last event has already ended.  This guarantees no two events in the
// same lane overlap, and minimises the total number of lanes used.

function assignLanes(events: CalendarEvent[], rangeStart: Date, rangeEnd: Date, unitMs: number, slotWidth: number): LanedEvent[] {
	const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

	// laneEndMs[i] = timestamp at which lane i becomes free
	const laneEndMs: number[] = [];
	const laned: (LanedEvent & { _endMs: number })[] = [];

	for (const ev of sorted) {
		const evStart = new Date(ev.start);
		const evEnd = new Date(ev.end);

		// Skip events entirely outside the visible range
		if (evEnd <= rangeStart || evStart >= rangeEnd) continue;

		const clampedStart = evStart < rangeStart ? rangeStart : evStart;
		const clampedEnd = evEnd > rangeEnd ? rangeEnd : evEnd;

		const left = ((clampedStart.getTime() - rangeStart.getTime()) / unitMs) * slotWidth;
		const width = Math.max(((clampedEnd.getTime() - clampedStart.getTime()) / unitMs) * slotWidth - 2, 28);

		// Find the first free lane (free = laneEndMs[lane] <= evStart)
		const startMs = evStart.getTime();
		let lane = laneEndMs.findIndex((endMs) => endMs <= startMs);
		if (lane === -1) {
			lane = laneEndMs.length;
			laneEndMs.push(0);
		}
		laneEndMs[lane] = evEnd.getTime();

		laned.push({ event: ev, lane, totalLanes: 0, left, width, _endMs: evEnd.getTime() });
	}

	const totalLanes = Math.max(laneEndMs.length, 1);
	return laned.map(({ _endMs, ...rest }) => ({ ...rest, totalLanes }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResourceTimeline({ resources, events, eventContent, onEventClick, initialView = 'week' }: ResourceTimelineProps) {
	const [view, setView] = useState<'day' | 'week' | 'month'>(initialView);
	const [anchor, setAnchor] = useState<Date>(() => new Date());
	const scrollRef = useRef<HTMLDivElement>(null);
	const todayColRef = useRef<HTMLDivElement>(null);
	const [containerWidth, setContainerWidth] = useState(0);
	const isDark = useDarkMode();

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		});
	};

	const formatTime = (dateString: string) => {
		return new Date(dateString).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});
	};

	// Measure the scrollable pane width so slots can stretch to fill it
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		setContainerWidth(el.clientWidth);
		const ro = new ResizeObserver(([entry]) => {
			setContainerWidth(entry.contentRect.width);
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	// ── Derive slot days/hours ────────────────────────────────────────────────
	const { days, slotWidth } = useMemo(() => {
		if (view === 'day') {
			const day = startOfDay(anchor);
			const hrs = Array.from({ length: 24 }, (_, i) => {
				const d = new Date(day);
				d.setHours(i);
				return d;
			});
			const min = 40;
			return {
				days: hrs,
				slotWidth: containerWidth > 0 ? Math.max(min, containerWidth / hrs.length) : min,
			};
		}
		if (view === 'week') {
			const start = startOfWeek(anchor);
			const ds = Array.from({ length: 7 }, (_, i) => addDays(start, i));
			const min = 80;
			return {
				days: ds,
				slotWidth: containerWidth > 0 ? Math.max(min, containerWidth / ds.length) : min,
			};
		}
		const start = startOfMonth(anchor);
		const ds = daysInRange(start, endOfMonth(anchor));
		const min = 34;
		return {
			days: ds,
			slotWidth: containerWidth > 0 ? Math.max(min, containerWidth / ds.length) : min,
		};
	}, [view, anchor, containerWidth]);

	const title = useMemo(() => formatRangeTitle(view, anchor, days), [view, anchor, days]);
	const totalWidth = days.length * slotWidth;

	const rangeStart = days[0];
	const rangeEnd = useMemo(
		() =>
			view === 'day' ? new Date(days[days.length - 1].getTime() + 3_600_000) : new Date(days[days.length - 1].getTime() + 86_400_000),
		[days, view],
	);
	const unitMs = view === 'day' ? 3_600_000 : 86_400_000;

	// ── Live now-indicator ────────────────────────────────────────────────────
	const [nowMs, setNowMs] = useState(Date.now);
	useEffect(() => {
		const id = setInterval(() => setNowMs(Date.now()), 60_000);
		return () => clearInterval(id);
	}, []);
	const nowLeft =
		nowMs >= rangeStart.getTime() && nowMs <= rangeEnd.getTime() ? ((nowMs - rangeStart.getTime()) / unitMs) * slotWidth : null;

	// ── Lane-assigned events per resource ─────────────────────────────────────
	const lanedByResource = useMemo(() => {
		const map: Record<string, LanedEvent[]> = {};
		for (const resource of resources) {
			const evs = events.filter((ev) => ev.resourceId === resource.id);
			map[resource.id] = assignLanes(evs, rangeStart, rangeEnd, unitMs, slotWidth);
		}
		return map;
	}, [events, resources, rangeStart, rangeEnd, unitMs, slotWidth]);

	// ── Dynamic row heights (grow with lane count) ────────────────────────────
	const rowHeights = useMemo(() => {
		const map: Record<string, number> = {};
		for (const resource of resources) {
			const laned = lanedByResource[resource.id] ?? [];
			const maxLanes = laned.length > 0 ? Math.max(...laned.map((l) => l.totalLanes)) : 1;
			map[resource.id] = Math.max(MIN_ROW_HEIGHT, maxLanes * LANE_HEIGHT + (maxLanes - 1) * LANE_GAP + ROW_PADDING * 2);
		}
		return map;
	}, [lanedByResource, resources]);

	// ── Navigation ───────────────────────────────────────────────────────────
	function navigate(dir: -1 | 1) {
		setAnchor((prev) => {
			const d = new Date(prev);
			if (view === 'day') d.setDate(d.getDate() + dir);
			else if (view === 'week') d.setDate(d.getDate() + dir * 7);
			else d.setMonth(d.getMonth() + dir);
			return d;
		});
	}

	// ── Scroll today into view on mount / view change ─────────────────────────
	useEffect(() => {
		if (todayColRef.current && scrollRef.current) {
			const el = todayColRef.current;
			const container = scrollRef.current;
			container.scrollLeft = Math.max(0, el.offsetLeft - container.offsetWidth / 2 + slotWidth / 2);
		}
	}, [view, anchor, slotWidth, containerWidth]);

	// ── Render ───────────────────────────────────────────────────────────────
	return (
		<div className='flex flex-col overflow-hidden rounded-lg border bg-card select-none'>
			{/* Toolbar */}
			<div className='flex flex-wrap items-center justify-between gap-2 border-b bg-card px-4 py-2.5'>
				<div className='flex items-center gap-1'>
					<Button variant='outline' size='sm' onClick={() => navigate(-1)} className='size-8 p-0'>
						<ChevronLeft className='h-3.5 w-3.5' />
					</Button>
					<Button variant='outline' size='sm' onClick={() => navigate(1)} className='size-8 p-0'>
						<ChevronRight className='h-3.5 w-3.5' />
					</Button>
					<Button variant='outline' size='sm' onClick={() => setAnchor(new Date())} className='h-8 px-3.5 text-xs'>
						Today
					</Button>
					<span className='ml-2 text-sm font-semibold text-foreground'>{title}</span>
				</div>
				<div className='flex items-center gap-1'>
					{(['day', 'week', 'month'] as const).map((v) => (
						<Button
							key={v}
							variant={view === v ? 'default' : 'ghost'}
							size='sm'
							onClick={() => setView(v)}
							className='h-8 px-3.5 text-xs capitalize'
						>
							{v}
						</Button>
					))}
				</div>
			</div>

			{/* Grid wrapper */}
			<div className='flex overflow-hidden'>
				{/* Fixed resource label column */}
				<div className='z-10 flex-shrink-0 border-r bg-muted/20' style={{ width: RESOURCE_COL_WIDTH }}>
					{/* Corner header */}
					<div className='flex items-center border-b bg-muted/40 px-3' style={{ height: HEADER_HEIGHT }}>
						<span className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>Room</span>
					</div>

					{/* Resource rows (heights must match timeline side) */}
					{resources.map((resource) => (
						<div
							key={resource.id}
							className='flex flex-col justify-center border-b px-3'
							style={{ height: rowHeights[resource.id] ?? MIN_ROW_HEIGHT }}
						>
							<span className='truncate text-sm leading-tight font-medium'>{resource.title}</span>
							{resource.roomType && (
								<span className='mt-0.5 truncate text-[11px] text-muted-foreground'>{resource.roomType}</span>
							)}
						</div>
					))}
				</div>

				{/* Timeline pane — scrolls only when slots hit their minimum width */}
				<div ref={scrollRef} className='flex-1 overflow-x-auto overflow-y-hidden'>
					<div style={{ width: totalWidth }}>
						{/* Slot header */}
						<div className='flex border-b bg-muted/40' style={{ height: HEADER_HEIGHT }}>
							{days.map((day, i) => {
								const todaySlot = view !== 'day' && isToday(day);
								return (
									<div
										key={i}
										ref={todaySlot ? todayColRef : undefined}
										className={cn(
											'flex flex-shrink-0 items-center justify-center border-r text-[12px] font-medium',
											todaySlot
												? 'bg-primary/10 font-semibold text-primary-foreground dark:text-primary'
												: 'text-muted-foreground',
										)}
										style={{ width: slotWidth, height: HEADER_HEIGHT }}
									>
										{formatSlotLabel(day, view)}
									</div>
								);
							})}
						</div>

						{/* One row per resource */}
						{resources.map((resource) => {
							const rowHeight = rowHeights[resource.id] ?? MIN_ROW_HEIGHT;
							const laned = lanedByResource[resource.id] ?? [];

							return (
								<div key={resource.id} className='relative border-b' style={{ height: rowHeight }}>
									{/* Slot background columns */}
									<div className='pointer-events-none absolute inset-0 flex'>
										{days.map((day, i) => {
											const todaySlot = view !== 'day' && isToday(day);
											return (
												<div
													key={i}
													className={cn(
														'h-full flex-shrink-0 border-r',
														todaySlot ? 'border-primary bg-primary/[0.3] dark:border-primary/10' : 'border-primary dark:border-primary/10',
													)}
													style={{ width: slotWidth }}
												/>
											);
										})}
									</div>

									{/* Now indicator line */}
									{nowLeft !== null && (
										<div
											className='pointer-events-none absolute top-0 bottom-0 z-20 bg-amber-500 opacity-60'
											style={{ left: nowLeft, width: 1 }}
										/>
									)}

									{/* Events — each placed in its own lane, no overlap */}
									{laned.map(({ event: ev, lane, left, width }) => {
										const top = ROW_PADDING + lane * (LANE_HEIGHT + LANE_GAP);
										const colorLight = ev.extendedProps?.colorLight as string | undefined;
										const colorDark = ev.extendedProps?.colorDark as string | undefined;
										const bgColor = isDark
											? (colorDark ?? ev.backgroundColor ?? '#166534')
											: (colorLight ?? ev.backgroundColor ?? '#C1F3C9');
										return (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<div
															key={ev.id}
															className='absolute z-10 cursor-pointer overflow-hidden rounded-sm transition-opacity hover:opacity-90 active:scale-[0.99]'
															style={{ left, width, top, height: LANE_HEIGHT, backgroundColor: bgColor }}
															onClick={() => onEventClick?.(ev)}
														>
															{eventContent ? (
																eventContent({ event: ev })
															) : (
																<div className='flex h-full items-center truncate px-2 text-xs font-medium'>
																	{ev.title}
																</div>
															)}
														</div>
													</TooltipTrigger>

													<TooltipContent
														side='left'
														className='border dark:border-white/10 border-black/10 bg-[#f2ede3]/60 dark:bg-neutral-900/50 text-primary-foreground dark:text-white shadow-lg backdrop-blur-xs'>
														<div className='flex flex-col items-center gap-1 text-xs'>
															<div className='font-semibold'>{ev.title}</div>
                                                            <div className='w-full h-[.5px] bg-gray-500/50' />
															<div className='flex flex-row gap-1 font-medium text-[10px]'>
																<div className='flex flex-col items-center rounded px-1 text-blue-600 dark:text-blue-400'>
																	<span>{formatDate(ev.start)}</span>
																	<span>{formatTime(ev.start)}</span>
																</div>
																<div className='flex flex-col items-center rounded px-1 text-red-700 dark:text-red-400'>
																	<span>{formatDate(ev.end)}</span>
																	<span>{formatTime(ev.end)}</span>
																</div>
															</div>
														</div>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										);
									})}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
