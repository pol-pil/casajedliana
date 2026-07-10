<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\Charge;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdateBookingStatuses extends Command
{
    protected $signature = 'bookings:update-statuses';
    protected $description = 'Auto-update booking statuses based on time rules';

    public function handle()
    {
        $now = Carbon::now();

        // 1. Pencil → Cancelled (3 days past booking creation, no 50% payment)
        Booking::where('status', 'pencil')
            ->where('created_at', '<=', $now->copy()->subDays(3))
            ->each(function ($booking) {
                $totalPaid = $booking->payments()->sum('amount');
                $required = $booking->total_amount * 0.50;

                if ($totalPaid < $required) {
                    $booking->status = 'cancelled';
                    $booking->save();
                    $this->syncRoomStatus($booking);
                    $this->info("Cancelled booking #{$booking->id}");
                }
            });

        // 2. Confirmed → No Show (check_out has passed, never checked in)
        Booking::where('status', 'confirmed')
            ->where('check_out', '<', $now)
            ->each(function ($booking) {
                $booking->status = 'no_show';
                $booking->save();
                $this->syncRoomStatus($booking);
                $this->info("No show booking #{$booking->id}");
            });

        // 3. Checked In → Late Checkout charge (1 hour past check_out)
        // $lateCharge = Charge::where('name', 'Late Checkout')
        //     ->where('is_active', true)
        //     ->first();

        // if ($lateCharge) {
        //     Booking::where('status', 'checked_in')
        //     ->where('check_out', '<=', $now->copy()->subHour())
        //     ->with('room')
        //     ->each(function ($booking) use ($lateCharge) {
        //         $alreadyCharged = $booking->bookingCharges()
        //             ->where('charge_id', $lateCharge->id)
        //             ->exists();
        
        //         if (!$alreadyCharged) {
        //             $roomPrice = $booking->room->price ?? 0;
        //             $lateAmount = $roomPrice * 0.10;
        
        //             $booking->bookingCharges()->create([
        //                 'charge_id' => $lateCharge->id,
        //                 'quantity'  => 1,
        //                 'value'     => $lateAmount,
        //                 'total'     => $lateAmount,
        //             ]);
        
        //             $this->info("Late checkout ₱{$lateAmount} charged on booking #{$booking->id}");
        //         }
        //     });
        // }

        // 4. Confirmed → Pencil (payment dropped below 50% of total amount)
        Booking::where('status', 'confirmed')
        ->each(function ($booking) {
            $totalPaid = $booking->payments()->sum('amount');
            $required = $booking->total_amount * 0.50;

            if ($totalPaid < $required) {
                $booking->status = 'pencil';
                $booking->save();
                $this->syncRoomStatus($booking);
                $this->info("Booking #{$booking->id} reverted to pencil (paid ₱{$totalPaid} of required ₱{$required})");
            }
        });

            // 5. Pencil → Confirmed (payment is above 50% of total amount)
        Booking::where('status', 'pencil')
        ->each(function ($booking) {
            $totalPaid = $booking->payments()->sum('amount');
            $required = $booking->total_amount * 0.50;

            if ($totalPaid >= $required) {
                $booking->status = 'confirmed';
                $booking->save();
                $this->syncRoomStatus($booking);
                $this->info("Booking #{$booking->id} confirmed (paid ₱{$totalPaid} of required ₱{$required})");
            }
        });
    }

    private function syncRoomStatus(Booking $booking)
    {
        $room = $booking->room;
        if (!$room) return;

        $status = strtolower($booking->status);

        if (in_array($status, ['pencil', 'confirmed', 'reserved'])) {
            $room->status = 'Reserved';
        } elseif ($status === 'checked_in') {
            $room->status = 'Occupied';
        } elseif (in_array($status, ['checked_out', 'cancelled', 'no_show'])) {
            $room->status = 'Available';
        }

        $room->save();
    }
}