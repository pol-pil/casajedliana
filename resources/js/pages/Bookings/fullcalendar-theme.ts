import { cn } from '@/lib/utils';

const paymentBadgeClassName: Record<string, string> = {
	paid: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
	partial: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
	unpaid: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
};

const eventClassName: Record<string, { className: string; light: string; dark: string }> = {
	pencil:     { className: 'booking-event booking-event--pencil',     light: '#FFE0AF', dark: '#513905' },
	confirmed:  { className: 'booking-event booking-event--confirmed',  light: '#C1F3C9', dark: '#14532d' },
	checked_in: { className: 'booking-event booking-event--checked-in', light: '#C1DBFF', dark: '#1e3a8a' },
	checked_out:{ className: 'booking-event booking-event--checked-out',light: '#e5e7eb', dark: '#374151' },
	cancelled:  { className: 'booking-event booking-event--cancelled',  light: '#fecaca', dark: '#991b1b' },
	no_show:    { className: 'booking-event booking-event--no-show',    light: '#fed7aa', dark: '#9a3412' },
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
};

export function getCalendarRoomBadgeClassName(type?: string): string {
	return roomBadgeClassName[type?.toLowerCase() ?? ''] ?? 'bg-gray-100 text-gray-700 dark:bg-white/20 dark:text-white';
}

export function getCalendarCheckInClassName(status?: string): string {
	return checkInTimeClassName[status?.toLowerCase() ?? ''] ?? 'text-gray-800 dark:text-white/80';
}

export function getCalendarEventTheme(status?: string): { className: string; light: string; dark: string } {
	return eventClassName[status?.toLowerCase() ?? ''] ?? eventClassName.confirmed;
}

export function getCalendarPaymentBadgeClassName(status?: string): string {
	return paymentBadgeClassName[status?.toLowerCase() ?? ''] ?? paymentBadgeClassName.unpaid;
}

export function getCalendarWrapperClassName(): string {
	return cn('dashboard-calendar');
}