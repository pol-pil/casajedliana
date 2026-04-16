import { cn } from '@/lib/utils';

const paymentBadgeClassName: Record<string, string> = {
	paid: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
	partial: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
	unpaid: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
};

const eventClassName: Record<string, { className: string; color: string }> = {
	pencil: { className: 'booking-event booking-event--pencil', color: '#FFE0AF' },
	confirmed: { className: 'booking-event booking-event--confirmed', color: '#C1F3C9' },
	checked_in: { className: 'booking-event booking-event--checked-in', color: '#C1DBFF' },
};

const checkInTimeClassName: Record<string, string> = {
	pencil: 'text-yellow-900 dark:text-yellow-100',
	confirmed: 'text-green-900 dark:text-green-100',
	reserved: 'text-green-900 dark:text-green-100',
	checked_in: 'text-blue-900 dark:text-blue-100',
};

const roomBadgeClassName: Record<string, string> = {
	standard: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
	suite: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
	quadro: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
	family: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
	penthouse: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
	resthouse: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
}

export function getCalendarRoomBadgeClassName(type?: string): string {
	return roomBadgeClassName[type?.toLowerCase() ?? ''] ?? 'text-muted-foregrouond';
}

export function getCalendarCheckInClassName(status?: string): string {
	return checkInTimeClassName[status?.toLowerCase() ?? ''] ?? 'text-muted-foreground';
}

export function getCalendarEventTheme(status?: string): { className: string; color: string } {
	return eventClassName[status?.toLowerCase() ?? ''] ?? eventClassName.confirmed;
}

export function getCalendarPaymentBadgeClassName(status?: string): string {
	return paymentBadgeClassName[status?.toLowerCase() ?? ''] ?? paymentBadgeClassName.unpaid;
}

export function getCalendarWrapperClassName(): string {
	return cn('dashboard-calendar');
}
