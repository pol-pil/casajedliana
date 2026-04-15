<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;



class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()


            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })


            ->when($request->role && $request->role !== 'all', function ($query) use ($request) {
                $query->where('role', $request->role);
            })


            ->when($request->status && $request->status !== 'all', function ($query) use ($request) {
                if ($request->status === 'active') {
                    $query->whereNotNull('email_verified_at');
                } else {
                    $query->whereNull('email_verified_at');
                }
            })

            ->latest()
            ->get()

            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'frontdesk',


                    'status' => $user->email_verified_at ? 'active' : 'inactive',
                ];
            });

        return Inertia::render('AdminPage/User', [
            'users' => $users,
            'filters' => [
                'search' => $request->search ?? '',
                'role' => $request->role ?? 'all',
                'status' => $request->status ?? 'all',
            ],
        ]);
    }

    public function updateStatus($id)
    {
        $user = User::findOrFail($id);

        if ($user->email_verified_at) {
            // Suspend
            $user->email_verified_at = null;
        } else {
            //  Activate
            $user->email_verified_at = Carbon::now();
        }

        $user->save();

        return back();
    }
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'min:6'],
            'role' => ['required'],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'email_verified_at' => now(),
        ]);

        return back();
    }

    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'password' => ['required', 'min:6'],
        ]);

        $user = User::findOrFail($id);


        if (Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'password' => 'New password cannot be the same as current password.',
            ]);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return back();
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $id],
            'role' => ['required'],
        ]);

        if (
            $user->id === auth()->id() &&
            strtolower($request->role) !== 'admin'
        ) {
            return back()->withErrors([
                'role' => 'You cannot change your own role to frontdesk.',
            ]);
        }

        if (
            strtolower($user->role) === 'admin' &&
            strtolower($request->role) !== 'admin'
        ) {
            $adminCount = User::whereRaw('LOWER(role) = ?', ['admin'])->count();

            if ($adminCount <= 1) {
                return back()->withErrors([
                    'role' => 'You cannot remove the last admin.',
                ]);
            }
        }

        $user->name = $request->name;
        $user->email = $request->email;
        $user->role = $request->role;
        $user->save();

        return back();
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // 🔒 PREVENT SELF DELETE
        if ($user->id === auth()->id()) {
            return back()->withErrors([
                'error' => 'You cannot delete your own account.',
            ]);
        }

        $user->delete();

        return back();
    }
}
