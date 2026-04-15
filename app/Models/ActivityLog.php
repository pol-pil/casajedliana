<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'staff_name',
        'action',
        'guest_name',
        'room_number',
        'status',
        'created_at',
    ];
}