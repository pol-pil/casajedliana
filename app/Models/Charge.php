<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Charge extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'value',
        'type',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
    ];
}
