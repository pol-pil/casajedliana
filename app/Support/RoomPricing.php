<?php

namespace App\Support;

use App\Models\Booking;
use App\Models\Rate;
use App\Models\Room;
use Carbon\CarbonImmutable;

class RoomPricing
{
    public function quote(Room $room, Rate $rate, mixed $checkIn, mixed $checkOut): array
    {
        $checkInAt = $this->parseDateTime($checkIn);
        $checkOutAt = $this->parseDateTime($checkOut);
        $nightDates = $this->nightDates($checkInAt, $checkOutAt);

        $pricingBreakdown = collect($nightDates)->map(function (CarbonImmutable $night) use ($room): array {
            $isWeekend = $this->isWeekend($night);
            $amount = $isWeekend
                ? (float) ($room->weekend_rate ?? $room->price)
                : (float) ($room->weekday_rate ?? $room->price);

            return [
                'date' => $night->toDateString(),
                'day_name' => $night->format('l'),
                'day_type' => $isWeekend ? 'weekend' : 'weekday',
                'amount' => round($amount, 2),
            ];
        })->values();

        $baseAmount = (float) $pricingBreakdown->sum('amount');
        $discountAmount = $this->discountAmount($baseAmount, $rate);

        return [
            'nights' => $pricingBreakdown->count(),
            'base_amount' => round($baseAmount, 2),
            'discount_amount' => round($discountAmount, 2),
            'total_amount' => round(max(0, $baseAmount - $discountAmount), 2),
            'pricing_breakdown' => $pricingBreakdown->all(),
            'weekday_nights' => $pricingBreakdown->where('day_type', 'weekday')->count(),
            'weekend_nights' => $pricingBreakdown->where('day_type', 'weekend')->count(),
        ];
    }

    public function detailsForBooking(Booking $booking): array
    {
        $baseAmount = (float) ($booking->base_amount ?? 0);
        $discountAmount = (float) ($booking->discount_amount ?? 0);
        $pricingBreakdown = collect($booking->pricing_breakdown ?? []);

        if ($pricingBreakdown->isEmpty() || $baseAmount <= 0) {
            $room = $booking->relationLoaded('room') ? $booking->room : $booking->room()->first();
            $rate = $booking->relationLoaded('rate') ? $booking->rate : $booking->rate()->first();

            if ($room && $rate) {
                return $this->quote($room, $rate, $booking->check_in, $booking->check_out);
            }
        }

        return [
            'nights' => $pricingBreakdown->count(),
            'base_amount' => round($baseAmount, 2),
            'discount_amount' => round($discountAmount, 2),
            'total_amount' => round((float) $booking->total_amount, 2),
            'pricing_breakdown' => $pricingBreakdown->values()->all(),
            'weekday_nights' => $pricingBreakdown->where('day_type', 'weekday')->count(),
            'weekend_nights' => $pricingBreakdown->where('day_type', 'weekend')->count(),
        ];
    }

    private function parseDateTime(mixed $value): CarbonImmutable
    {
        return CarbonImmutable::parse($value, 'Asia/Manila')->setTimezone('Asia/Manila');
    }

    private function nightDates(CarbonImmutable $checkInAt, CarbonImmutable $checkOutAt): array
    {
        $start = $checkInAt->startOfDay();
        $end = $checkOutAt->startOfDay();

        if ($start->equalTo($end)) {
            return [$start];
        }

        $dates = [];

        for ($date = $start; $date->lt($end); $date = $date->addDay()) {
            $dates[] = $date;
        }

        return $dates;
    }

    private function isWeekend(CarbonImmutable $date): bool
    {
        return in_array($date->dayOfWeek, [CarbonImmutable::FRIDAY, CarbonImmutable::SATURDAY], true);
    }

    private function discountAmount(float $baseAmount, Rate $rate): float
    {
        if ($rate->type === 'percentage') {
            return $baseAmount * ((float) $rate->value / 100);
        }

        return min($baseAmount, (float) $rate->value);
    }
}
