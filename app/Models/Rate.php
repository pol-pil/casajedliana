<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'value',
        'type',
        'is_active',
        'is_custom',
    ];

    protected $casts = [
        'value'     => 'decimal:2',
        'is_active' => 'boolean',
        'is_custom' => 'boolean',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
