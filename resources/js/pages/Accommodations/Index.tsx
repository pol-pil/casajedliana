// resources/js/pages/Accommodations/Index.tsx
import { useMemo, useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { format } from 'date-fns';

import { DateRange } from 'react-day-picker';

import RoomCard from '@/components/rooms/RoomCard';
import RoomHeader from '@/components/rooms/RoomHeader';
import RoomFilters from '@/components/rooms/RoomFilters';
import RoomDialogs from '@/components/rooms/RoomDialogs';

import { Room } from '@/types/room';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'Admin', href: '/admin' },
	{ title: 'Rooms', href: '/rooms' },
];

type Status = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

type Category = 'Standard' | 'Suite' | 'Quadro' | 'Family' | 'Penthouse' | 'Rest House'| 'Pavilion'| 'Gazebo'| 'Cabana'| 'Editha'| 'Eliana'| 'Ediane';

const statusColor = (status: Status) => {
	switch (status) {
		case 'Available':
			return 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400';

		case 'Occupied':
			return 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400';

		case 'Reserved':
			return 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400';

		case 'Maintenance':
			return 'bg-gray-200 text-gray-600 dark:bg-gray-950 dark:text-gray-400';

		default:
			return 'bg-gray-200 text-gray-600 dark:bg-gray-950 dark:text-gray-400';
	}
};

export default function Index() {
	const [addRoomOpen, setAddRoomOpen] = useState(false);
	const [editRoomOpen, setEditRoomOpen] = useState(false);
	const [roomNumber, setRoomNumber] = useState('');
	const [roomType, setRoomType] = useState('');
	const [capacity, setCapacity] = useState(1);
	const [weekdayRate, setWeekdayRate] = useState(0);
	const [weekendRate, setWeekendRate] = useState(0);
	const [description, setDescription] = useState('');

	const [bedType, setBedType] = useState('');
	const [amenities, setAmenities] = useState<string[]>([]);

	useEffect(() => {
		if (!addRoomOpen && !editRoomOpen) return;

		const parts: string[] = [];

		if (bedType) parts.push(bedType);
		if (amenities.length > 0) parts.push(...amenities);

		setDescription(parts.join(' • '));
	}, [bedType, amenities, addRoomOpen, editRoomOpen]);

	const generateDescription = () => {
		const parts = [];

		if (bedType) parts.push(bedType);
		if (amenities.length > 0) parts.push(...amenities);

		const result = parts.join(' • ');

		if (result) {
			setDescription(result);
		}
	};

	const [deleteRoomOpen, setDeleteRoomOpen] = useState(false);
	const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

	const { props } = usePage() as any;
	const rawRooms = props.rooms ?? [];
	const serverStartDate = props.startDate;
	const serverEndDate = props.endDate;

	const [range, setRange] = useState<DateRange | undefined>({
		from: serverStartDate ? new Date(serverStartDate) : new Date(),
		to: serverEndDate ? new Date(serverEndDate) : new Date(),
	});

	const normalizedRooms: Room[] = rawRooms.map((r: any) => {
		const id = r.id;
		const roomNumber = r.roomNumber ?? r.room_number ?? String(id);
		const category = (r.category ?? r.room_type ?? 'Standard') as Category;
		const capacity = Number(r.capacity ?? 1);
		const beds = r.description ?? '';
		const amenities: string[] = [];

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
			amenities: [],
			status,
			price: r.price ?? undefined,
			weekdayRate: r.weekday_rate ?? r.price ?? undefined,
			weekendRate: r.weekend_rate ?? r.price ?? undefined,
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

	const roomFeatures = [
		'WiFi',
		'Air Conditioning',
		'TV',
		'Hot Shower',
		'Mini Bar',
		'Refrigerator',
		'Work Desk',
		'Closet',
		'Balcony',
		'Sofa',
	];

	return (
		<AppLayout breadcrumbs={breadcrumbs} showDatePicker>
			<Head title='Rooms' />

			<div className='space-y-6 p-6'>
				{/* HEADER */}
				<RoomHeader
					search={search}
					setSearch={setSearch}
					onAdd={() => {
						setRoomNumber('');
						setRoomType('');
						setCapacity(1);
						setWeekdayRate(0);
						setWeekendRate(0);
						setDescription('');
						setBedType('');
						setAmenities([]);
						setAddRoomOpen(true);
					}}
				/>

				<RoomFilters
					activeCategory={activeCategory}
					setActiveCategory={setActiveCategory}
					activeStatus={activeStatus}
					setActiveStatus={setActiveStatus}
				/>

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
										const parts = room.beds ? room.beds.split(' • ') : [];

										setSelectedRoom(room);
										setRoomNumber(room.roomNumber);
										setRoomType(room.category);
										setCapacity(room.capacity);
										setWeekdayRate(room.weekdayRate ?? room.price ?? 0);
										setWeekendRate(room.weekendRate ?? room.price ?? 0);

										setDescription(room.beds ?? '');
										setBedType(parts[0] || '');
										setAmenities(parts.slice(1));

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
				<RoomDialogs
					{...{
						addRoomOpen,
						setAddRoomOpen,
						editRoomOpen,
						setEditRoomOpen,
						deleteRoomOpen,
						setDeleteRoomOpen,
						selectedRoom,
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
						description,
						setDescription,
						bedType,
						setBedType,
						amenities,
						setAmenities,
						roomFeatures,
						refreshRooms,
					}}
				/>
			</div>
		</AppLayout>
	);
}
