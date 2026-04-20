<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_number',
        'room_type',
        'capacity',
        'description',
        'price',
        'weekday_rate',
        'weekend_rate',
        'status',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'weekday_rate' => 'decimal:2',
        'weekend_rate' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function bookings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function isAvailable($checkIn, $checkOut): bool
    {
        $overlapping = $this->bookings()
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in', '<', $checkIn)
                            ->where('check_out', '>', $checkOut);
                    });
            })
            ->whereNotIn('status', ['cancelled'])
            ->exists();

        return ! $overlapping;
    }

    public function getWeekdayRateAttribute($value): string
    {
        return (string) ($value ?? $this->attributes['price']);
    }

    public function getWeekendRateAttribute($value): string
    {
        return (string) ($value ?? $this->attributes['price']);
    }
}
