<?php

use App\Http\Controllers\AccommodationController;
use App\Http\Controllers\BookingChargesController;
use App\Http\Controllers\BookingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentsController;
use App\Http\Controllers\RatesController;
use App\Http\Middleware\FrontdeskMiddleware;
use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::middleware(FrontdeskMiddleware::class)->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('dashboard');

        Route::get('/rooms', [AccommodationController::class, 'index'])
            ->name('rooms.index');

        Route::patch(
            '/rooms/{room}/status',
            [AccommodationController::class, 'updateStatus']
        )->name('rooms.updateStatus');

        Route::post(
            '/rooms/{room}/check-in',
            [AccommodationController::class, 'checkIn']
        )->name('rooms.checkIn');

        Route::post(
            '/rooms/{room}/check-out',
            [AccommodationController::class, 'checkOut']
        )->name('rooms.checkOut');

        Route::post(
            '/rooms/{room}/cancel-booking',
            [AccommodationController::class, 'cancelBooking']
        )->name('rooms.cancelBooking');

        Route::post(
            '/rooms/{room}/mark-paid',
            [AccommodationController::class, 'markPaid']
        )->name('rooms.markPaid');

        Route::post(
            '/rooms/{room}/confirm-cleaning',
            [AccommodationController::class, 'confirmCleaning']
        )->name('rooms.confirmCleaning');

        Route::prefix('reports')->group(function () {
            Route::get('/charts', function () {
                return Inertia::render('reports/charts');
            })->name('reports.charts');

            Route::get('/history', function () {
                return Inertia::render('reports/history');
            })->name('reports.history');
        });

        Route::get('/bookings', [BookingsController::class, 'index'])->name('bookings.index');
        Route::post('/bookings', [BookingsController::class, 'store'])->name('bookings.store');
        Route::put('/bookings/{booking}', [BookingsController::class, 'update'])->name('bookings.update');

        Route::patch('/bookings/{booking}/status', [BookingsController::class, 'updateStatus']);

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
        // Payment routes
        Route::post('/payments', [PaymentsController::class, 'storePayment'])->name('payments.store');
        // Booking Charge routes
        Route::post('/booking-charges', [BookingChargesController::class, 'storeBookingCharge'])->name('booking-charges.store');
        // Add Rooms
        Route::post('/rooms', [AccommodationController::class, 'store']);
        Route::patch('/rooms/{room}', [AccommodationController::class, 'update'])->name('rooms.update');
        Route::delete('/rooms/{room}', [AccommodationController::class, 'destroy'])->name('rooms.destroy');
        // Print SOA
        Route::get('/bookings/{booking}/print', [BookingsController::class, 'printSOA'])->name('bookings.printSOA');

        Route::get('/test', [TestController::class, 'index'])->name('test.index');
    });
});

require __DIR__.'/settings.php';
