<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client' => 'required|array',
            'client.first_name' => 'required|string|max:100',
            'client.last_name' => 'required|string|max:100',
            'client.email' => 'nullable|email|max:60',
            'client.contact_number' => 'required|string|max:20',
            'client.address' => 'nullable|string',
            'client.company' => 'nullable|string',
            'room_id' => 'required|exists:rooms,id',
            'rate_id' => 'nullable|exists:rates,id',
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
            'guest_count' => 'required|integer|min:1',
            'purpose' => 'nullable|string',
            'booking_type_id' => 'required|exists:booking_types,id',
            'payment_method' => 'nullable|string',
            'remarks' => 'nullable|string',
            'custom_discount' => 'nullable|numeric|min:0',
            'custom_discount_type' => 'nullable|in:percentage,exact',
        ];
    }

    public function messages(): array
    {
        return [
            'check_out.after' => 'The check-out date must be after the check-in date.',
        ];
    }
}
