import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Pencil, Trash2, PauseCircle } from 'lucide-react'
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { router } from '@inertiajs/react'

type User = {
	id: number
	name: string
	email: string
	role: string
	status: string
}

type Props = {
	user: User
	authUserId: number
	onEdit: (user: User) => void
	onDelete: (user: User) => void
}

export default function UserActionsMenu({ user, authUserId, onEdit, onDelete }: Props) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' size='icon'>
					<MoreVertical className='h-4 w-4' />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end'>
				{/* EDIT */}
				<DropdownMenuItem onClick={() => onEdit(user)}>
					<Pencil className='mr-2 h-4 w-4' />
					Edit
				</DropdownMenuItem>

				{/* STATUS */}
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
							<PauseCircle className='mr-2 h-4 w-4' />
							{user.status === 'active' ? 'Suspend' : 'Activate'}
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Confirm Action</AlertDialogTitle>
							<AlertDialogDescription>This will change user access.</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={() => router.patch(`/admin/users/${user.id}/status`)}>
								Confirm
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* DELETE */}
				<DropdownMenuItem
					className='text-red-500 disabled:opacity-50'
					disabled={user.id === authUserId}
					onSelect={(e) => {
						if (user.id === authUserId) {
							e.preventDefault()
							return
						}
						e.preventDefault()
						onDelete(user)
					}}
				>
					<Trash2 className='mr-2 h-4 w-4' />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}