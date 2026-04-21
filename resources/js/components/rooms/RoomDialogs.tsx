import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import RoomFormFields from './RoomFormFields'
import { toast } from 'sonner'
import { router } from '@inertiajs/react'

export default function RoomDialogs(props: any) {
	const {
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
	} = props

	return (
		<>
			{/* ADD */}
			<Dialog open={addRoomOpen} onOpenChange={setAddRoomOpen}>
				<DialogContent className='max-w-lg dark:bg-primary-foreground/80 backdrop-blur-xs'>
					<DialogHeader>
						<DialogTitle>Add New Room</DialogTitle>
					</DialogHeader>

					<RoomFormFields {...props} />

					<Button
						className='w-full'
						onClick={() => {
							router.post('/rooms', {
								room_number: roomNumber,
								room_type: roomType,
								capacity,
								weekday_rate: weekdayRate,
								weekend_rate: weekendRate,
								description,
							}, {
								onSuccess: () => {
									toast.success(`Room ${roomNumber} added`)
									setAddRoomOpen(false)
									refreshRooms()
								}
							})
						}}
					>
						Save Room
					</Button>
				</DialogContent>
			</Dialog>

			{/* EDIT */}
			<Dialog open={editRoomOpen} onOpenChange={setEditRoomOpen}>
				<DialogContent className='max-w-lg dark:bg-primary-foreground/80 backdrop-blur-xs'>
					<DialogHeader>
						<DialogTitle>Edit Room</DialogTitle>
					</DialogHeader>

					<RoomFormFields {...props} />

					<Button
						className='w-full'
						onClick={() => {
							if (!selectedRoom) return

							router.patch(`/rooms/${selectedRoom.id}`, {
								room_number: roomNumber,
								room_type: roomType,
								capacity,
								weekday_rate: weekdayRate,
								weekend_rate: weekendRate,
								description,
							}, {
								onSuccess: () => {
									toast.success(`Room updated`)
									setEditRoomOpen(false)
									refreshRooms()
								}
							})
						}}
					>
						Update Room
					</Button>
				</DialogContent>
			</Dialog>

			{/* DELETE */}
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
								if (!selectedRoom) return
								router.delete(`/rooms/${selectedRoom.id}`, {
									onSuccess: () => {
										toast.success(`Room deleted`)
										setDeleteRoomOpen(false)
										refreshRooms()
									}
								})
							}}
						>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
