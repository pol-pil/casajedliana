<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'room_number' => 'required|string|max:50|unique:rooms,room_number',
            'room_type' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'weekday_rate' => 'required|numeric|min:0',
            'weekend_rate' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'weekday_rate.required' => 'The weekday rate is required.',
            'weekend_rate.required' => 'The weekend rate is required.',
        ];
    }
}
