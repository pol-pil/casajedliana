import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from '@/components/ui/alert-dialog'

type Props = {
	open: boolean
	setOpen: (v: boolean) => void
	onDelete: () => void
}

export default function DeleteUserDialog({ open, setOpen, onDelete }: Props) {
	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete User?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete the user.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>

					<AlertDialogAction
						className='bg-red-600 hover:bg-red-700'
						onClick={onDelete}
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}