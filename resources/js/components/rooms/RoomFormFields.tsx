import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
	roomNumber: string;
	setRoomNumber: (v: string) => void;

	roomType: string;
	setRoomType: (v: string) => void;

	capacity: number;
	setCapacity: (v: number) => void;

	weekdayRate: number;
	setWeekdayRate: (v: number) => void;

	weekendRate: number;
	setWeekendRate: (v: number) => void;

	bedType: string;
	setBedType: (v: string) => void;

	amenities: string[];
	setAmenities: React.Dispatch<React.SetStateAction<string[]>>;

	description: string;
	setDescription: (v: string) => void;

	roomFeatures: string[];
};

export default function RoomFormFields({
	roomNumber,
	setRoomNumber,
	roomType,
	setRoomType,
	capacity,
	setCapacity,
	weekdayRate,
	setWeekdayRate,
	weekendRate,
	setWeekendRate,
	bedType,
	setBedType,
	amenities,
	setAmenities,
	description,
	setDescription,
	roomFeatures,
}: Props) {
	return (
		<div className='space-y-4'>
			{/* ROW 1 */}
			<div className='grid grid-cols-2 gap-4'>
				<div className='space-y-1'>
					<label className='text-sm font-medium'>Room Number</label>
					<Input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
				</div>

				<div className='space-y-1'>
					<label className='text-sm font-medium'>Room Type</label>
					<Select value={roomType} onValueChange={setRoomType}>
						<SelectTrigger>
							<SelectValue placeholder='Select type' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='Standard'>Standard</SelectItem>
							<SelectItem value='Suite'>Suite</SelectItem>
							<SelectItem value='Quadro'>Quadro</SelectItem>
							<SelectItem value='Family'>Family</SelectItem>
							<SelectItem value='Penthouse'>Pent House</SelectItem>
							<SelectItem value='Resthouse'>Rest House</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* ROW 2 */}
			<div className='grid grid-cols-2 gap-4'>
				<div className='space-y-1'>
					<label className='text-sm font-medium'>Capacity</label>
					<Input type='number' value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
				</div>

				<div className='space-y-1'>
					<label className='text-sm font-medium'>Weekday Rate</label>
					<Input type='number' value={weekdayRate} onChange={(e) => setWeekdayRate(Number(e.target.value))} />
				</div>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div className='space-y-1'>
					<label className='text-sm font-medium'>Weekend Rate</label>
					<Input type='number' value={weekendRate} onChange={(e) => setWeekendRate(Number(e.target.value))} />
				</div>
			</div>

			{/* ROW 3 */}
			<div className='grid grid-cols-2 gap-4'>
				<div className='space-y-1'>
					<label className='text-sm font-medium'>Bed Type</label>
					<Select value={bedType} onValueChange={setBedType}>
						<SelectTrigger>
							<SelectValue placeholder='Select bed' />
						</SelectTrigger>
						<SelectContent>
							{/* SINGLE / BASIC */}
							<SelectItem value='1 Single Bed'>1 Single Bed</SelectItem>
							<SelectItem value='2 Single Beds'>2 Single Beds</SelectItem>
							<SelectItem value='3 Single Beds'>3 Single Beds</SelectItem>

							{/* DOUBLE / STANDARD */}
							<SelectItem value='1 Double Bed'>1 Double Bed</SelectItem>
							<SelectItem value='2 Double Beds'>2 Double Beds</SelectItem>

							{/* QUEEN */}
							<SelectItem value='1 Queen Bed'>1 Queen Bed</SelectItem>
							<SelectItem value='2 Queen Beds'>2 Queen Beds</SelectItem>

							{/* KING */}
							<SelectItem value='1 King Bed'>1 King Bed</SelectItem>
							<SelectItem value='2 King Beds'>2 King Beds</SelectItem>

							{/* MIXED / FAMILY */}
							<SelectItem value='1 King + 1 Single'>1 King + 1 Single</SelectItem>
							<SelectItem value='1 Queen + 1 Single'>1 Queen + 1 Single</SelectItem>
							<SelectItem value='2 Queen + 1 Single'>2 Queen + 1 Single</SelectItem>

							{/* FLEXIBLE */}
							<SelectItem value='Twin Beds'>Twin Beds</SelectItem>
							<SelectItem value='Multiple Beds'>Multiple Beds</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* AMENITIES FULL WIDTH */}
			<div className='space-y-2'>
				<label className='text-sm font-medium'>Amenities</label>

				<div className='grid grid-cols-3 gap-2'>
					{roomFeatures.map((item) => {
						const isSelected = amenities.includes(item);

						return (
							<label
								key={item}
								className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 text-xs ${
									isSelected ? 'border-primary bg-primary/10' : 'hover:bg-muted'
								}`}
							>
								<input
									type='checkbox'
									className='h-4 w-4'
									checked={isSelected}
									onChange={(e) => {
										if (e.target.checked) {
											setAmenities((prev) => [...prev, item]);
										} else {
											setAmenities((prev) => prev.filter((a) => a !== item));
										}
									}}
								/>
								<span className='truncate'>{item}</span>
							</label>
						);
					})}
				</div>
			</div>

			{/* DESCRIPTION (FULL WIDTH) */}
			<div className='space-y-1'>
				<label className='text-sm font-medium'>Room Description</label>

				<textarea
					rows={4}
					className='w-full resize-none rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none'
					placeholder='Select Bed Type and Amenities to auto-generate description, or write your own'
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
			</div>
		</div>
	);
}
