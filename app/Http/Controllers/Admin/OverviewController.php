<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Inertia\Inertia;
use Carbon\Carbon;


class OverviewController extends Controller
{
    public function index()
    {
        // ✅ USERS (NO STATUS FILTER FOR NOW — safe)
        $users = User::select('id', 'name', 'email', 'role')
            ->latest()
            ->get();

        // ✅ ACTIVITY LOGS (REAL DATA)
        $logs = ActivityLog::latest()
            ->limit(100)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'staffId' => $log->user_id,
                    'user' => $log->staff_name,
                    'role' => User::find($log->user_id)?->role ?? 'N/A',
                    'action' => $log->action,
                    'guest' => $log->guest_name,
                    'room' => $log->room_number,
                    'date' => Carbon::parse($log->created_at)
                        ->timezone('Asia/Manila')
                        ->format('M d, h:i A'),
                ];
            });

        // ✅ SEND TO FRONTEND
        return Inertia::render('AdminPage/Index', [
            'users' => $users,
            'logs' => $logs,
        ]);
    }
}
