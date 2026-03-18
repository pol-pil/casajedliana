<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomCleaningLog extends Model
{
    protected $fillable = [
        'room_id',
        'started_at',
        'completed_at',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
