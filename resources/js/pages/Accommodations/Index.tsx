// resources/js/pages/Accommodations/Index.tsx
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { format } from 'date-fns';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

import RoomCard from '@/components/rooms/RoomCard';
import { Room } from '@/types/room';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Rooms', href: '/rooms' }];

/* ====================== */
/* Types */
/* ====================== */

type Status = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

type Category = 'Standard' | 'Suite' | 'Quadro' | 'Family' | 'Penthouse' | 'Rest House';

const mockAmenities: Record<string, string[]> = {
	Standard: ['Air Conditioning', 'Private Bathroom', '32" Smart TV', 'Wi-Fi', 'Wardrobe', 'Work Desk'],
	Suite: ['Living Area', 'Mini Refrigerator', '50" Smart TV', 'Sofa Lounge', 'Coffee Table', 'Wi-Fi'],
	Quadro: ['Large Bathroom', 'Dining Table', 'Smart TV', 'Wi-Fi'],
	Family: ['Connecting Rooms', 'Entertainment System', 'Dining Area', 'Wi-Fi'],
	Penthouse: ['Private Balcony', 'Mini Bar', 'Premium Bathroom', 'Lounge Area', 'Wi-Fi'],
	'Rest House': ['Kitchenette', 'Outdoor Seating', 'Large Dining Area', 'Wi-Fi'],
};

const statusColor = (status: Status) => {
	switch (status) {
		case 'Available':
			return 'bg-green-500/20 text-green-400';

		case 'Occupied':
			return 'bg-red-500/20 text-red-400';

		case 'Reserved':
			return 'bg-yellow-500/20 text-yellow-400';

		case 'Maintenance':
			return 'bg-gray-500/20 text-gray-400';

		default:
			return 'bg-gray-100 text-gray-600';
	}
};

export default function Index() {
	const [addRoomOpen, setAddRoomOpen] = useState(false);

	const [roomNumber, setRoomNumber] = useState('');
	const [roomType, setRoomType] = useState('');
	const [capacity, setCapacity] = useState(1);
	const [price, setPrice] = useState(0);
	const [description, setDescription] = useState('');

	const [editRoomOpen, setEditRoomOpen] = useState(false);
	const [deleteRoomOpen, setDeleteRoomOpen] = useState(false);
	const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

	const { props } = usePage() as any;
	const rawRooms = props.rooms ?? [];
	const serverStartDate = props.startDate;
	const serverEndDate = props.endDate;

	const [isDateOpen, setIsDateOpen] = useState(false);
	const [range, setRange] = useState<DateRange | undefined>({
		from: serverStartDate ? new Date(serverStartDate) : new Date(),
		to: serverEndDate ? new Date(serverEndDate) : new Date(),
	});

	const normalizedRooms: Room[] = rawRooms.map((r: any) => {
		const id = r.id;
		const roomNumber = r.roomNumber ?? r.room_number ?? String(id);
		const category = (r.category ?? r.room_type ?? 'Standard') as Category;
		const capacity = Number(r.capacity ?? 1);
		const beds = r.beds ?? r.description ?? '';
		const amenities =
			r.amenities && Array.isArray(r.amenities) && r.amenities.length > 0
				? r.amenities
				: (mockAmenities[r.room_type ?? r.category ?? 'Standard'] ?? []);

		const normalizeStatus = (status: string): Status => {
			const s = status?.toLowerCase();

			if (s === 'maintenance') return 'Maintenance';
			if (s === 'occupied') return 'Occupied';
			if (s === 'reserved') return 'Reserved';
			return 'Available';
		};

		const status: Status = normalizeStatus(r.status);

		return {
			id,
			roomNumber,
			category,
			capacity,
			beds,
			amenities,
			status,
			price: r.price ?? undefined,
		};
	});

	const [search, setSearch] = useState<string>('');
	const [activeStatus, setActiveStatus] = useState<Status | 'All'>('All');
	const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

	const filteredRooms = useMemo(() => {
		return normalizedRooms.filter((room) => {
			const keyword = search.toLowerCase().trim();
			const normalizedKeyword = keyword.replace(/room/g, '').trim();

			const matchSearch = room.roomNumber.toLowerCase().includes(normalizedKeyword) || room.category.toLowerCase().includes(keyword);
			const matchStatus = activeStatus === 'All' || room.status === activeStatus;
			const matchCategory = activeCategory === 'All' || room.category === activeCategory;
			return matchSearch && matchStatus && matchCategory;
		});
	}, [normalizedRooms, search, activeStatus, activeCategory]);

	const groupedRooms = useMemo(() => {
		return Object.entries(
			filteredRooms.reduce((acc: Record<string, Room[]>, room) => {
				if (!acc[room.category]) acc[room.category] = [];
				acc[room.category].push(room);
				return acc;
			}, {}),
		);
	}, [filteredRooms]);

	function applyRange() {
		if (!range?.from || !range?.to) return;

		const start = format(range.from, 'yyyy-MM-dd');
		const end = format(range.to, 'yyyy-MM-dd');

		router.get(
			'/rooms',
			{
				start,
				end,
			},
			{
				preserveState: true,
				replace: true,
			},
		);

		setIsDateOpen(false);
	}

	function refreshRooms() {
		router.get(
			'/rooms',
			{
				start: format(range?.from ?? new Date(), 'yyyy-MM-dd'),
				end: format(range?.to ?? new Date(), 'yyyy-MM-dd'),
			},
			{ replace: true },
		);
	}

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title='Rooms' />

			<div className='space-y-6 p-6'>
				{/* HEADER */}
				<div className='flex flex-col gap-4 md:flex-row md:justify-between'>
					<h1 className='text-2xl font-semibold'>Room Management</h1>

					<div className='flex items-center gap-3'>
						<Input
							placeholder='Search room number...'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className='max-w-xs'
						/>

						<Button onClick={() => setAddRoomOpen(true)}>+ Add Room</Button>

						<Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
							<PopoverTrigger asChild>
								<Button variant='outline' className='justify-start'>
									<CalendarDays className='mr-2 h-4 w-4' />
									{range?.from && range?.to
										? `${format(range.from, 'MMM dd')} - ${format(range.to, 'MMM dd')}`
										: 'Select Dates'}
								</Button>
							</PopoverTrigger>

							<PopoverContent className='w-[650px] max-w-full p-3'>
								<div className='w-full'>
									<Calendar
										mode='range'
										selected={range}
										onSelect={setRange}
										numberOfMonths={2}
										pagedNavigation
										className='w-full rounded-md border'
									/>
								</div>

								<div className='flex justify-end pt-2'>
									<Button size='sm' onClick={applyRange}>
										Apply
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				<div className='flex flex-col gap-4 md:flex-row md:items-center'>
					<div className='w-full md:w-60'>
						<Select value={activeCategory} onValueChange={(value) => setActiveCategory(value as Category | 'All')}>
							<SelectTrigger>
								<SelectValue placeholder='Filter by Room Type' />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value='All'>All Types</SelectItem>
								<SelectItem value='Standard'>Standard</SelectItem>
								<SelectItem value='Suite'>Suite</SelectItem>
								<SelectItem value='Quadro'>Quadro</SelectItem>
								<SelectItem value='Family'>Family</SelectItem>
								<SelectItem value='Pent House'>Pent House</SelectItem>
								<SelectItem value='Rest House'>Rest House</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='flex flex-wrap gap-2'>
						{(['All', 'Available', 'Occupied', 'Reserved', 'Maintenance'] as const).map((status) => (
							<Button
								key={status}
								size='sm'
								variant={activeStatus === status ? 'default' : 'outline'}
								onClick={() => setActiveStatus(status)}
							>
								{status}
							</Button>
						))}
					</div>
				</div>

				{groupedRooms.map(([category, categoryRooms]) => (
					<div key={category} className='space-y-6'>
						<h2 className='border-b pb-3 text-xl font-semibold'>{category}</h2>

						<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
							{categoryRooms.map((room) => (
								<RoomCard
									key={room.id}
									room={room}
									statusColor={statusColor}
									refreshRooms={refreshRooms}
									onEdit={(room) => {
										setSelectedRoom(room);
										setRoomNumber(room.roomNumber);
										setRoomType(room.category);
										setCapacity(room.capacity);
										setPrice(room.price ?? 0);
										setDescription(room.beds ?? '');
										setEditRoomOpen(true);
									}}
									onDelete={(room) => {
										setSelectedRoom(room);
										setDeleteRoomOpen(true);
									}}
								/>
							))}
						</div>
					</div>
				))}
				<Dialog open={addRoomOpen} onOpenChange={setAddRoomOpen}>
					<DialogContent className='max-w-lg'>
						<DialogHeader>
							<DialogTitle>Add New Room</DialogTitle>
						</DialogHeader>

						<div className='space-y-4'>
							<div className='space-y-1'>
								<label className='text-sm font-medium'>Room Number</label>
								<Input placeholder='Example: 101' value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
							</div>

							<div className='space-y-1'>
								<label className='text-sm font-medium'>Room Type</label>

								<Select value={roomType} onValueChange={(value) => setRoomType(value)}>
									<SelectTrigger>
										<SelectValue placeholder='Select room type' />
									</SelectTrigger>

									<SelectContent>
										<SelectItem value='All'>All Types</SelectItem>
										<SelectItem value='Standard Room'>Standard</SelectItem>
										<SelectItem value='Suite Room'>Suite</SelectItem>
										<SelectItem value='Quadro Room'>Quadro</SelectItem>
										<SelectItem value='Family Room'>Family</SelectItem>
										<SelectItem value='Pent House'>Pent House</SelectItem>
										<SelectItem value='Rest House'>Rest House</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className='grid grid-cols-2 gap-3'>
								<div className='space-y-1'>
									<label className='text-sm font-medium'>Capacity</label>
									<Input
										type='number'
										min={1}
										placeholder='Guests'
										value={capacity}
										onChange={(e) => setCapacity(Number(e.target.value))}
									/>
								</div>

								<div className='space-y-1'>
									<label className='text-sm font-medium'>Price per Night</label>
									<Input
										type='number'
										min={0}
										placeholder='₱'
										value={price}
										onChange={(e) => setPrice(Number(e.target.value))}
									/>
								</div>
							</div>

							<div className='space-y-1'>
								<label className='text-sm font-medium'>Room Description</label>
								<Input
									placeholder='Example: 2 Queen Beds'
									value={description}
									onChange={(e) => setDescription(e.target.value)}
								/>
							</div>

							<Button
								className='w-full'
								onClick={() => {
									if (!roomNumber || !roomType) {
										alert('Room number and room type are required.');
										return;
									}

									router.post(
										'/rooms',
										{
											room_number: roomNumber,
											room_type: roomType,
											capacity,
											price,
											description,
										},
										{
											onSuccess: () => {
												toast.success(`Room ${roomNumber} added successfully`);

												setAddRoomOpen(false);

												setRoomNumber('');
												setRoomType('');
												setCapacity(1);
												setPrice(0);
												setDescription('');

												refreshRooms();
											},
											onError: () => {
												toast.error(`Failed to add Room ${roomNumber}`);
											},
										},
									);
								}}
							>
								Save Room
							</Button>
						</div>
					</DialogContent>
				</Dialog>
				<Dialog open={editRoomOpen} onOpenChange={setEditRoomOpen}>
					<DialogContent className='max-w-lg'>
						<DialogHeader>
							<DialogTitle>Edit Room</DialogTitle>
						</DialogHeader>

						<div className='space-y-4'>
							{/* ROOM NUMBER */}
							<div className='space-y-1'>
								<label className='text-sm font-medium'>Room Number</label>
								<Input placeholder='Example: 101' value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
							</div>

							{/* ROOM TYPE */}
							<div className='space-y-1'>
								<label className='text-sm font-medium'>Room Type</label>

								<Select value={roomType} onValueChange={(value) => setRoomType(value)}>
									<SelectTrigger>
										<SelectValue placeholder='Select room type' />
									</SelectTrigger>

									<SelectContent>
										<SelectItem value='All'>All Types</SelectItem>
										<SelectItem value='Standard Room'>Standard</SelectItem>
										<SelectItem value='Suite Room'>Suite</SelectItem>
										<SelectItem value='Quadro Room'>Quadro</SelectItem>
										<SelectItem value='Family Room'>Family</SelectItem>
										<SelectItem value='Pent House'>Pent House</SelectItem>
										<SelectItem value='Rest House'>Rest House</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* CAPACITY + PRICE */}
							<div className='grid grid-cols-2 gap-3'>
								<div className='space-y-1'>
									<label className='text-sm font-medium'>Capacity</label>
									<Input
										type='number'
										min={1}
										placeholder='Guests'
										value={capacity}
										onChange={(e) => setCapacity(Number(e.target.value))}
									/>
								</div>

								<div className='space-y-1'>
									<label className='text-sm font-medium'>Price per Night</label>
									<Input
										type='number'
										min={0}
										placeholder='₱'
										value={price}
										onChange={(e) => setPrice(Number(e.target.value))}
									/>
								</div>
							</div>

							{/* ROOM DESCRIPTION */}
							<div className='space-y-1'>
								<label className='text-sm font-medium'>Room Description / Beds</label>
								<Input
									placeholder='Example: 2 Queen Beds'
									value={description}
									onChange={(e) => setDescription(e.target.value)}
								/>
							</div>

							{/* SAVE BUTTON */}
							<Button
								className='w-full'
								onClick={() => {
									if (!selectedRoom) return;

									router.patch(
										`/rooms/${selectedRoom.id}`,
										{
											room_number: roomNumber,
											room_type: roomType,
											capacity,
											price,
											description,
										},
										{
											onSuccess: () => {
												toast.success(`Room ${roomNumber} updated successfully`);

												setEditRoomOpen(false);
												refreshRooms();
											},
											onError: () => {
												toast.error(`Failed to update Room ${roomNumber}`);
											},
										},
									);
								}}
							>
								Update Room
							</Button>
						</div>
					</DialogContent>
				</Dialog>
				<Dialog open={deleteRoomOpen} onOpenChange={setDeleteRoomOpen}>
					<DialogContent className='max-w-sm'>
						<DialogHeader>
							<DialogTitle>Delete Room</DialogTitle>
						</DialogHeader>

						<p>Are you sure you want to delete Room {selectedRoom?.roomNumber}?</p>

						<div className='flex justify-end gap-2 pt-4'>
							<Button variant='outline' onClick={() => setDeleteRoomOpen(false)}>
								Cancel
							</Button>

							<Button
								variant='destructive'
								onClick={() => {
									if (!selectedRoom) return;
									router.delete(`/rooms/${selectedRoom.id}`, {
										onSuccess: () => {
											toast.success(`Room ${selectedRoom?.roomNumber} deleted successfully`);

											setDeleteRoomOpen(false);
											refreshRooms();
										},
										onError: () => {
											toast.error(`Failed to delete Room ${selectedRoom?.roomNumber}`);
										},
									});
								}}
							>
								Delete
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</AppLayout>
	);
}
