<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HotelSetting;
use Illuminate\Support\Facades\Storage; // ✅ IMPORTANT
use Inertia\Inertia; // ✅ IMPORTANT

class HotelInfoController extends Controller
{
    public function index()
    {
        return Inertia::render('AdminPage/HotelInfo'); // ✅ safer
    }

    public function store(Request $request)
    {
        $request->validate([
            'hotel_name' => 'required|string|max:255',
            'logo' => 'nullable|file|mimes:jpg,jpeg,png,svg|max:2048',
        ]);

        $hotel = HotelSetting::first();

        if (!$hotel) {
            $hotel = new HotelSetting();
        }

        $hotel->hotel_name = $request->hotel_name;

        // ✅ HANDLE LOGO
        if ($request->hasFile('logo')) {

            // delete old logo
            if ($hotel->logo && Storage::disk('public')->exists($hotel->logo)) {
                Storage::disk('public')->delete($hotel->logo);
            }

            // store new logo
            $path = $request->file('logo')->store('logos', 'public');

            $hotel->logo = $path;
        }

        $hotel->save();

        return back();
    }

    public function backup()
    {
        $db = config('database.connections.mysql.database');
        $user = config('database.connections.mysql.username');
        $pass = config('database.connections.mysql.password');

        $filename = 'backup_' . now()->format('Y-m-d_H-i-s') . '.sql';
        $path = storage_path("app/{$filename}");

        // ⚠️ Windows (XAMPP)
        $mysqldump = "C:\\xampp\\mysql\\bin\\mysqldump";

        $command = "{$mysqldump} --user={$user} --password={$pass} {$db} > {$path}";
        exec($command);

        return response()->download($path)->deleteFileAfterSend(true);
    }


    public function restore(Request $request)
    {
        $request->validate([
            'backup' => 'required|file|mimes:sql',
        ]);

        $file = $request->file('backup')->getPathname();

        $db = config('database.connections.mysql.database');
        $user = config('database.connections.mysql.username');
        $pass = config('database.connections.mysql.password');

        // ⚠️ Windows (XAMPP)
        $mysql = "C:\\xampp\\mysql\\bin\\mysql";

        $command = "{$mysql} --user={$user} --password={$pass} {$db} < {$file}";
        exec($command);

        return back()->with('success', 'Database restored successfully');
    }
}
