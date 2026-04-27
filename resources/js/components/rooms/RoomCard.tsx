import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import { Room } from '@/types/room';

type Status = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

type Props = {
	room: Room;
	statusColor: (status: Status) => string;
	onEdit: (room: Room) => void;
	onDelete: (room: Room) => void;
	refreshRooms: () => void;
};

export default function RoomCard({ room, statusColor, onEdit, onDelete, refreshRooms }: Props) {
	const parts = room.beds ? room.beds.split(' • ') : [];
	const bedOnly = parts[0] || '';
	const amenitiesOnly = parts.slice(1);

	return (
		<Dialog>
			<Card className='relative flex min-h-[180px] sm:min-h-[200px] flex-col justify-between p-6 text-center transition hover:shadow-lg'>
				{/* ACTION MENU */}
				<div className='absolute top-4 right-4 z-10'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className='rounded-full p-2 transition hover:bg-muted'>
								<Pencil size={18} />
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='end' className='w-48'>
							{/* SET MAINTENANCE */}
							{room.status === 'Available' && (
								<DropdownMenuItem
									onClick={() => {
										router.patch(
											`/rooms/${room.id}/status`,
											{ status: 'Maintenance' },
											{
												onSuccess: () => {
													toast.success(`Room ${room.roomNumber} set to Maintenance`);
													refreshRooms();
												},
											},
										);
									}}
								>
									Set Maintenance
								</DropdownMenuItem>
							)}

							{/* SET AVAILABLE */}
							{room.status === 'Maintenance' && (
								<DropdownMenuItem
									onClick={() => {
										router.patch(
											`/rooms/${room.id}/status`,
											{ status: 'Available' },
											{
												onSuccess: () => {
													toast.success(`Room ${room.roomNumber} is now Available`);
													refreshRooms();
												},
											},
										);
									}}
								>
									Set Available
								</DropdownMenuItem>
							)}

							<DropdownMenuItem onClick={() => onEdit(room)}>Edit Room</DropdownMenuItem>

							<DropdownMenuItem className='text-red-500' onClick={() => onDelete(room)}>
								Delete Room
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* CARD CONTENT */}
				<DialogTrigger asChild>
					<div className='flex h-full cursor-pointer flex-col justify-between'>
						<div>
							<h3 className='text-lg font-semibold'>Room {room.roomNumber}</h3>

							{room.price !== undefined && <p className='text-xs text-muted-foreground'>₱{room.price}</p>}

							<p className='text-sm text-muted-foreground'>{room.category}</p>
							{room.weekdayRate !== undefined && room.weekendRate !== undefined && (
								<p className='text-xs text-muted-foreground'>Sun-Thu ₱{room.weekdayRate} | Fri-Sat ₱{room.weekendRate}</p>
							)}
							<p className='text-sm text-muted-foreground'>Capacity: {room.capacity} Pax</p>
						</div>

						<div className='mt-4 flex justify-center'>
							<span className={`rounded-full px-4 py-2 text-sm font-medium ${statusColor(room.status)}`}>{room.status}</span>
						</div>
					</div>
				</DialogTrigger>
			</Card>

			{/* MODAL */}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Room {room.roomNumber}</DialogTitle>
					<p className='text-muted-foreground'>{room.category}</p>

					<div className='mt-4 space-y-3 text-sm'>
						<p>
							<strong>Capacity:</strong> {room.capacity} Pax
						</p>
						<p>
							<strong>Weekday Rate:</strong> ₱{room.weekdayRate ?? room.price ?? 0}
						</p>
						<p>
							<strong>Weekend Rate:</strong> ₱{room.weekendRate ?? room.price ?? 0}
						</p>
						<p>
							<strong>Beds:</strong> {bedOnly}
						</p>

						<div>
							<h3 className='mb-2 font-medium'>Amenities</h3>
							<div className='flex flex-wrap gap-2'>
								{amenitiesOnly.map((a, i) => (
									<span key={i} className='rounded-full bg-teal-500/10 px-3 py-1 text-xs text-teal-400'>
										{a}
									</span>
								))}
							</div>
						</div>
					</div>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
