<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Http\Request;


class OverviewController extends Controller
{
    public function index(Request $request)
    {
        $start = $request->get('start');
        $end = $request->get('end');

        $query = ActivityLog::with('user')->latest();

        if ($start && $end) {
            $startDate = Carbon::parse($start)->timezone('Asia/Manila')->startOfDay();
            $endDate = Carbon::parse($end)->timezone('Asia/Manila')->endOfDay();

            if ($startDate->isSameDay($endDate)) {
                $query->whereDate('created_at', $startDate);
            } else {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }
        }

        $logs = $query
            ->limit(100)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'staffId' => $log->user_id,
                    'user' => $log->staff_name,
                    'role' => $log->user->role ?? 'N/A',
                    'action' => $log->action,
                    'guest' => $log->guest_name,
                    'room' => $log->room_number,
                    'date' => Carbon::parse($log->created_at)
                        ->timezone('Asia/Manila')
                        ->format('M d, h:i A'),
                ];
            });

        return Inertia::render('AdminPage/Index', [
            'users' => User::latest()->get(),
            'logs' => $logs,
        ]);
    }
}
