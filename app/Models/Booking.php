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

    //history

    protected $appends = [
    'guest',
    'contact',
    'room_display',
    'amount',
    'balance',
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

    public function getDurationAttribute()
    {
        return $this->check_in->diffInDays($this->check_out);
    }

    // history 

    public function getGuestAttribute()
    {
        return $this->client->first_name . ' ' . $this->client->last_name;
    }

    public function getContactAttribute()
    {
        return $this->client->contact_number;
    }

    public function getRoomDisplayAttribute()
    {
        return $this->room->room_number . ' - ' . $this->room->room_type;
    }

    public function getChargesTotalAttribute()
    {
        return $this->bookingCharges->sum('total');
    }

    public function getPaymentsTotalAttribute()
    {
        return $this->payments->sum('amount');
    }

    public function getAmountAttribute()
    {
        return $this->total_amount + $this->charges_total;
    }

    public function getBalanceAttribute()
    {
        return $this->amount - $this->payments_total;
    }
}
