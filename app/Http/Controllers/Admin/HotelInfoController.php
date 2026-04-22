<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HotelSetting;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HotelInfoController extends Controller
{
    public function index()
    {
        return Inertia::render('AdminPage/HotelInfo');
    }

    public function store(Request $request)
    {
        $request->validate([
            'hotel_name' => 'required|string|max:255',
            'logo' => 'nullable|file|mimes:jpg,jpeg,png,svg|max:2048',
        ]);

        $hotel = HotelSetting::first() ?? new HotelSetting();

        $hotel->hotel_name = $request->hotel_name;

        // HANDLE LOGO
        if ($request->hasFile('logo')) {

            if ($hotel->logo && Storage::disk('public')->exists($hotel->logo)) {
                Storage::disk('public')->delete($hotel->logo);
            }

            $path = $request->file('logo')->store('logos', 'public');
            $hotel->logo = $path;
        }

        $hotel->save();

        return back()->with('success', 'Hotel info saved');
    }

    // =========================
    // 🔥 BACKUP DATABASE
    // =========================
    public function backup()
    {
        $db   = config('database.connections.mysql.database');
        $user = config('database.connections.mysql.username');
        $pass = config('database.connections.mysql.password');

        $filename = 'backup_' . now()->format('Y-m-d_H-i-s') . '.sql';
        $path = storage_path("app/{$filename}");

        // ✅ XAMPP PATH (adjust if needed)
        $mysqldump = '"C:\\xampp\\mysql\\bin\\mysqldump.exe"';

        // ✅ IMPORTANT: include data + structure
        $command = "{$mysqldump} --user={$user} --password=\"{$pass}\" --databases {$db} --routines --triggers > \"{$path}\"";

        exec($command, $output, $result);

        // ❌ if failed
        if ($result !== 0 || !file_exists($path)) {
            return back()->with('error', 'Backup failed. Check mysqldump path.');
        }

        return response()->download($path)->deleteFileAfterSend(true);
    }

    // =========================
    // 🔥 RESTORE DATABASE
    // =========================
    public function restore(Request $request)
    {
        $request->validate([
            'backup' => 'required|file|mimes:sql',
        ]);

        $file = $request->file('backup')->getRealPath();

        $db   = config('database.connections.mysql.database');
        $user = config('database.connections.mysql.username');
        $pass = config('database.connections.mysql.password');

        // ✅ XAMPP PATH
        $mysql = '"C:\\xampp\\mysql\\bin\\mysql.exe"';

        $command = "{$mysql} --user={$user} --password=\"{$pass}\" {$db} < \"{$file}\"";

        exec($command, $output, $result);

        if ($result !== 0) {
            return back()->with('error', 'Restore failed. Check file or MySQL path.');
        }

        return back()->with('success', 'Database restored successfully');
    }
}