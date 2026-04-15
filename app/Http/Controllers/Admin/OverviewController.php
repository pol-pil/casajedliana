<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;

class OverviewController extends Controller
{
    public function index()
    {

        $users = User::query()
            ->select('id', 'name', 'email', 'role')
            ->latest()
            ->get();


        $logs = [];

        return Inertia::render('AdminPage/Index', [
            'users' => $users,
            'logs' => [],
        ]);
    }
}
