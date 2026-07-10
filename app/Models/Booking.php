<?php

namespace App\Models;

use App\Support\RoomPricing;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'room_id',
        'receptionist_id',
        'rate_id',
        'check_in',
        'check_out',
        'remarks',
        'purpose',
        'booking_type_id',
        'guest_count',
        'total_amount',
        'base_amount',
        'discount_amount',
        'pricing_breakdown',
        'payment_status',
        'status',
    ];

    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'total_amount' => 'decimal:2',
        'base_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'pricing_breakdown' => 'array',
    ];

    protected $appends = [
        'guest',
        'contact',
        'room_display',
        'amount',
        'balance',
        'pricing_details',
    ];

    public function client(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function room(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function receptionist(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'receptionist_id');
    }

    public function rate(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Rate::class);
    }

    public function bookingType(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(BookingType::class);
    }

    public function payments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function bookingCharges(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(BookingCharge::class);
    }

    public function getTotalPaidAttribute(): float
    {
        return (float) $this->payments()->sum('amount');
    }

    public function getDurationAttribute(): int
    {
        return $this->check_in->diffInDays($this->check_out);
    }

    public function getGuestAttribute(): string
    {
        return $this->client->first_name . ' ' . $this->client->last_name;
    }

    public function getContactAttribute(): string
    {
        return $this->client->contact_number;
    }

    public function getRoomDisplayAttribute(): string
    {
        return $this->room->room_number . ' - ' . $this->room->room_type;
    }

    public function getChargesTotalAttribute(): float
    {
        return (float) $this->bookingCharges->sum('total');
    }

    public function getPaymentsTotalAttribute(): float
    {
        return (float) $this->payments->sum('amount');
    }

    public function getTotalWithChargesAttribute(): float
    {
        return (float) ($this->total_amount + $this->charges_total);
    }

    public function refreshPaymentStatus(): void
    {
        $this->loadMissing(['payments', 'bookingCharges']);

        $totalPaid = (float) $this->payments->sum('amount');
        $totalWithCharges = (float) ($this->total_amount + $this->bookingCharges->sum('total'));

        if ($totalPaid <= 0) {
            $this->payment_status = 'unpaid';
        } elseif ($totalPaid >= $totalWithCharges) {
            $this->payment_status = 'paid';
        } else {
            $this->payment_status = 'partial';
        }
    }

    public function getAmountAttribute(): float
    {
        return $this->total_with_charges;
    }

    public function getBalanceAttribute(): float
    {
        return $this->amount - $this->payments_total;
    }

    public function getPricingDetailsAttribute(): array
    {
        return app(RoomPricing::class)->detailsForBooking($this);
    }
}
