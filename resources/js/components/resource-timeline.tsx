import React, { useMemo, useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

const RESOURCE_COL_WIDTH = 120;
const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 56;

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
    const day = d.getDay();
    d.setDate(d.getDate() - day);
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

function formatDayLabel(date: Date, view: 'day' | 'week' | 'month') {
    if (view === 'month') {
        return date.toLocaleDateString('en-US', { day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
}

function formatMonthLabel(date: Date) {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function isToday(date: Date) {
    const t = new Date();
    return (
        date.getDate() === t.getDate() &&
        date.getMonth() === t.getMonth() &&
        date.getFullYear() === t.getFullYear()
    );
}

export default function ResourceTimeline({
    resources,
    events,
    eventContent,
    onEventClick,
    initialView = 'week',
}: ResourceTimelineProps) {
    const [view, setView] = useState<'day' | 'week' | 'month'>(initialView);
    const [anchor, setAnchor] = useState<Date>(() => new Date());
    const scrollRef = useRef<HTMLDivElement>(null);
    const todayRef = useRef<HTMLDivElement>(null);

    const { days, title, slotWidth } = useMemo(() => {
        if (view === 'day') {
            const day = startOfDay(anchor);
            const hours = Array.from({ length: 24 }, (_, i) => {
                const d = new Date(day);
                d.setHours(i);
                return d;
            });
            return {
                days: hours,
                title: day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
                slotWidth: 60,
            };
        }
        if (view === 'week') {
            const start = startOfWeek(anchor);
            const ds = Array.from({ length: 7 }, (_, i) => addDays(start, i));
            return {
                days: ds,
                title: `${ds[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${ds[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                slotWidth: 100,
            };
        }
        // month
        const start = startOfMonth(anchor);
        const end = endOfMonth(anchor);
        const ds = daysInRange(start, end);
        return {
            days: ds,
            title: formatMonthLabel(anchor),
            slotWidth: 36,
        };
    }, [view, anchor]);

    const totalWidth = days.length * slotWidth;

    function navigate(dir: -1 | 1) {
        setAnchor((prev) => {
            const d = new Date(prev);
            if (view === 'day') d.setDate(d.getDate() + dir);
            else if (view === 'week') d.setDate(d.getDate() + dir * 7);
            else d.setMonth(d.getMonth() + dir);
            return d;
        });
    }

    function goToday() {
        setAnchor(new Date());
    }

    useEffect(() => {
        if (todayRef.current && scrollRef.current) {
            const el = todayRef.current;
            const container = scrollRef.current;
            const offset = el.offsetLeft - container.offsetWidth / 2 + slotWidth / 2;
            container.scrollLeft = Math.max(0, offset);
        }
    }, [view, anchor, slotWidth]);

    function getEventPosition(event: CalendarEvent): { left: number; width: number } | null {
        const rangeStart = days[0];
        const rangeEnd = view === 'day'
            ? new Date(days[days.length - 1].getTime() + 3600 * 1000)
            : new Date(days[days.length - 1].getTime() + 86400 * 1000);

        const evStart = new Date(event.start);
        const evEnd = new Date(event.end);

        if (evEnd <= rangeStart || evStart >= rangeEnd) return null;

        const clampedStart = evStart < rangeStart ? rangeStart : evStart;
        const clampedEnd = evEnd > rangeEnd ? rangeEnd : evEnd;

        const unitMs = view === 'day' ? 3600 * 1000 : 86400 * 1000;
        const left = ((clampedStart.getTime() - rangeStart.getTime()) / unitMs) * slotWidth;
        const width = Math.max(((clampedEnd.getTime() - clampedStart.getTime()) / unitMs) * slotWidth - 2, 20);

        return { left, width };
    }

    const eventsByResource = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {};
        for (const ev of events) {
            if (!map[ev.resourceId]) map[ev.resourceId] = [];
            map[ev.resourceId].push(ev);
        }
        return map;
    }, [events]);

    const nowMs = Date.now();
    const rangeStart = days[0];
    const rangeEnd = view === 'day'
        ? new Date(days[days.length - 1].getTime() + 3600 * 1000)
        : new Date(days[days.length - 1].getTime() + 86400 * 1000);
    const unitMs = view === 'day' ? 3600 * 1000 : 86400 * 1000;
    const nowLeft = nowMs >= rangeStart.getTime() && nowMs <= rangeEnd.getTime()
        ? ((nowMs - rangeStart.getTime()) / unitMs) * slotWidth
        : null;

    return (
        <div className="rounded-lg border bg-card overflow-hidden flex flex-col" style={{ fontFamily: 'inherit' }}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToday}>
                        Today
                    </Button>
                    <span className="text-sm font-medium ml-2">{title}</span>
                </div>
                <div className="flex items-center gap-1">
                    {(['day', 'week', 'month'] as const).map((v) => (
                        <Button
                            key={v}
                            variant={view === v ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView(v)}
                        >
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="flex overflow-hidden">
                {/* Resource column (fixed) */}
                <div className="flex-shrink-0 border-r" style={{ width: RESOURCE_COL_WIDTH }}>
                    {/* Header cell */}
                    <div
                        className="flex items-center px-3 border-b bg-muted/40 text-xs font-semibold text-muted-foreground"
                        style={{ height: HEADER_HEIGHT }}
                    >
                        Room
                    </div>
                    {resources.map((resource) => (
                        <div
                            key={resource.id}
                            className="flex flex-col justify-center px-3 border-b"
                            style={{ height: ROW_HEIGHT }}
                        >
                            <span className="text-sm font-medium leading-tight truncate">{resource.title}</span>
                            {resource.roomType && (
                                <span className="text-xs text-muted-foreground truncate">{resource.roomType}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Scrollable timeline area */}
                <div ref={scrollRef} className="overflow-x-auto flex-1" style={{ position: 'relative' }}>
                    <div style={{ width: totalWidth, minWidth: '100%' }}>
                        {/* Day/hour header row */}
                        <div
                            className="flex border-b bg-muted/40 relative"
                            style={{ height: HEADER_HEIGHT }}
                        >
                            {days.map((day, i) => {
                                const today = view !== 'day' && isToday(day);
                                return (
                                    <div
                                        key={i}
                                        ref={today ? todayRef : undefined}
                                        className={cn(
                                            'flex-shrink-0 flex items-center justify-center border-r text-xs font-medium',
                                            today
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground'
                                        )}
                                        style={{ width: slotWidth, height: HEADER_HEIGHT }}
                                    >
                                        {view === 'day'
                                            ? day.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
                                            : formatDayLabel(day, view)}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Resource rows */}
                        {resources.map((resource) => {
                            const rowEvents = eventsByResource[resource.id] ?? [];
                            return (
                                <div
                                    key={resource.id}
                                    className="border-b relative"
                                    style={{ height: ROW_HEIGHT }}
                                >
                                    {/* Slot grid lines */}
                                    <div className="absolute inset-0 flex pointer-events-none">
                                        {days.map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex-shrink-0 border-r border-border/40"
                                                style={{ width: slotWidth }}
                                            />
                                        ))}
                                    </div>

                                    {/* Now indicator */}
                                    {nowLeft !== null && (
                                        <div
                                            className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                                            style={{ left: nowLeft }}
                                        />
                                    )}

                                    {/* Events */}
                                    {rowEvents.map((ev) => {
                                        const pos = getEventPosition(ev);
                                        if (!pos) return null;
                                        return (
                                            <div
                                                key={ev.id}
                                                className="absolute top-1 bottom-1 rounded cursor-pointer z-10 overflow-hidden"
                                                style={{
                                                    left: pos.left,
                                                    width: pos.width,
                                                    backgroundColor: ev.backgroundColor ?? '#3b82f6',
                                                }}
                                                onClick={() => onEventClick?.(ev)}
                                                title={ev.title}
                                            >
                                                {eventContent
                                                    ? eventContent({ event: ev })
                                                    : (
                                                        <div className="px-1.5 py-0.5 text-xs font-medium text-white truncate h-full flex items-center">
                                                            {ev.title}
                                                        </div>
                                                    )}
                                            </div>
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