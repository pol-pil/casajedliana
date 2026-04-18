<?php

use App\Http\Controllers\AccommodationController;
use App\Http\Controllers\BookingChargesController;
use App\Http\Controllers\BookingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentsController;
use App\Http\Controllers\RatesController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\ChartController;
use App\Http\Controllers\Admin\OverviewController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Middleware\FrontdeskMiddleware;
use App\Http\Middleware\AdminMiddleware;

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

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Rooms
        Route::get('/rooms', [AccommodationController::class, 'index'])->name('rooms.index');
        Route::post('/rooms', [AccommodationController::class, 'store']);
        Route::patch('/rooms/{room}', [AccommodationController::class, 'update'])->name('rooms.update');
        Route::delete('/rooms/{room}', [AccommodationController::class, 'destroy'])->name('rooms.destroy');
        Route::patch('/rooms/{room}/status', [AccommodationController::class, 'updateStatus'])->name('rooms.updateStatus');
        Route::post('/rooms/{room}/check-in', [AccommodationController::class, 'checkIn']);
        Route::post('/rooms/{room}/check-out', [AccommodationController::class, 'checkOut']);
        Route::post('/rooms/{room}/cancel-booking', [AccommodationController::class, 'cancelBooking']);
        Route::post('/rooms/{room}/mark-paid', [AccommodationController::class, 'markPaid']);
        Route::post('/rooms/{room}/confirm-cleaning', [AccommodationController::class, 'confirmCleaning']);

        // Reports
        Route::prefix('reports')->group(function () {
            Route::get('/charts', [ChartController::class, 'index'])->name('reports.charts');
            Route::get('/history', [HistoryController::class, 'index'])->name('reports.history');
        });

        // Bookings
        Route::get('/bookings', [BookingsController::class, 'index'])->name('bookings.index');
        Route::post('/bookings', [BookingsController::class, 'store'])->name('bookings.store');
        Route::put('/bookings/{booking}', [BookingsController::class, 'update'])->name('bookings.update');
        Route::patch('/bookings/{booking}/status', [BookingsController::class, 'updateStatus']);
        Route::get('/bookings/{booking}/print', [BookingsController::class, 'printSOA'])->name('bookings.printSOA');

        // Rates
        Route::get('/rates', [RatesController::class, 'index'])->name('rates.index');
        Route::post('/rates', [RatesController::class, 'storeRate'])->name('rates.store');
        Route::put('/rates/{rate}', [RatesController::class, 'updateRate'])->name('rates.update');
        Route::delete('/rates/{rate}', [RatesController::class, 'destroyRate'])->name('rates.destroy');

        // Charges
        Route::post('/charges', [RatesController::class, 'storeCharge'])->name('charges.store');
        Route::put('/charges/{charge}', [RatesController::class, 'updateCharge'])->name('charges.update');
        Route::delete('/charges/{charge}', [RatesController::class, 'destroyCharge'])->name('charges.destroy');

        // Booking Types
        Route::post('/booking-types', [RatesController::class, 'storeBookingType'])->name('booking-types.store');
        Route::put('/booking-types/{bookingType}', [RatesController::class, 'updateBookingType'])->name('booking-types.update');
        Route::delete('/booking-types/{bookingType}', [RatesController::class, 'destroyBookingType'])->name('booking-types.destroy');

        // Payments
        Route::post('/payments', [PaymentsController::class, 'storePayment'])->name('payments.store');

        // Booking Charges
        Route::post('/booking-charges', [BookingChargesController::class, 'storeBookingCharge'])->name('booking-charges.store');
    });

    Route::middleware(AdminMiddleware::class)->group(function () {
        Route::get('/admin', [OverviewController::class, 'index'])
    ->name('admin.index');
        
        // users management
        Route::get('/admin/users', [AdminUserController::class, 'index'])
            ->name('admin.users.index');
        Route::post('/admin/users', [AdminUserController::class, 'store'])
            ->name('admin.users.store');
        Route::patch('/admin/users/{user}/password', [AdminUserController::class, 'resetPassword'])
            ->name('admin.users.resetPassword');
        Route::patch('/admin/users/{user}', [AdminUserController::class, 'update'])
            ->name('admin.users.update');
        Route::patch('/admin/users/{user}/status', [AdminUserController::class, 'updateStatus'])
            ->name('admin.users.updateStatus');
        Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy'])
            ->name('admin.users.destroy');

        Route::get('/admin/hotel-info', fn() => Inertia::render('AdminPage/HotelInfo'));
    });
});

require __DIR__ . '/settings.php';
