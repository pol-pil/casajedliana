<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\BookingsController;
use App\Http\Controllers\RatesController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('/bookings', [BookingsController::class, 'index'])->name('bookings.index');
    Route::post('/bookings', [BookingsController::class, 'store'])->name('bookings.store');

    Route::get('/rates', [RatesController::class, 'index'])->name('rates.index');
    // Rate routes
    Route::post('/rates', [RatesController::class, 'storeRate'])->name('rates.store');
    Route::put('/rates/{rate}', [RatesController::class, 'updateRate'])->name('rates.update');
    Route::delete('/rates/{rate}', [RatesController::class, 'destroyRate'])->name('rates.destroy');
    // Charge routes
    Route::post('/charges', [RatesController::class, 'storeCharge'])->name('charges.store');
    Route::put('/charges/{charge}', [RatesController::class, 'updateCharge'])->name('charges.update');
    Route::delete('/charges/{charge}', [RatesController::class, 'destroyCharge'])->name('charges.destroy');
    // Booking Type routes
    Route::post('/booking-types', [RatesController::class, 'storeBookingType'])->name('booking-types.store');
    Route::put('/booking-types/{bookingType}', [RatesController::class, 'updateBookingType'])->name('booking-types.update');
    Route::delete('/booking-types/{bookingType}', [RatesController::class, 'destroyBookingType'])->name('booking-types.destroy');
});

require __DIR__.'/settings.php';