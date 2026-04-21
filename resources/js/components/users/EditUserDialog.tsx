import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import UserFormFields from './UserFormFields'

type Props = {
	open: boolean
	setOpen: (v: boolean) => void

	editForm: any
	setEditForm: (v: any) => void

	editError: any
	setEditError: any

	selectedUser: any

	onSave: () => void
	onResetPassword: () => void
}

export default function EditUserDialog({
	open,
	setOpen,
	editForm,
	setEditForm,
	editError,
	setEditError,
	selectedUser,
	onSave,
	onResetPassword,
}: Props) {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className='dark:bg-primary-foreground/80 backdrop-blur-xs'>
				<DialogHeader>
					<DialogTitle>Edit User</DialogTitle>
				</DialogHeader>

				<UserFormFields
					name={editForm.name}
					setName={(v) => {
						setEditForm({ ...editForm, name: v })
						setEditError((prev: any) => ({ ...prev, name: '' }))
					}}
					email={editForm.email}
					setEmail={(v) => {
						setEditForm({ ...editForm, email: v })
						setEditError((prev: any) => ({ ...prev, email: '' }))
					}}
					role={editForm.role}
					setRole={(v) => setEditForm({ ...editForm, role: v })}
					error={editError}
				/>

				<DialogFooter className='flex justify-between'>
					<Button variant='outline' onClick={onResetPassword}>
						Reset Password
					</Button>

					<Button onClick={onSave}>Save Changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}