<?php

namespace App\Models;

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
        'payment_status',
        'status',
    ];

    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function receptionist()
    {
        return $this->belongsTo(User::class, 'receptionist_id');
    }

    public function rate()
    {
        return $this->belongsTo(Rate::class);
    }

    public function bookingType()
    {
        return $this->belongsTo(BookingType::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function bookingCharges()
    {
        return $this->hasMany(BookingCharge::class);
    }

    public function getTotalPaidAttribute()
    {
        return $this->payments()->sum('amount');
    }

    public function getBalanceAttribute()
    {
        return $this->total_amount - $this->total_paid;
    }

    public function getDurationAttribute()
    {
        return $this->check_in->diffInDays($this->check_out);
    }
}