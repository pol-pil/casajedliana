<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingCharge extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'charge_id',
        'quantity',
        'value',
        'total',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function charge()
    {
        return $this->belongsTo(Charge::class);
    }
}