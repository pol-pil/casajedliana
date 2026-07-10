import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

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

	resetForm: any
	setResetForm: (v: any) => void

	passwordError: string
	setPasswordError: (v: string) => void

	confirmOpen: boolean
	setConfirmOpen: (v: boolean) => void

	onConfirm: () => void
}

export default function ResetPasswordDialog({
	open,
	setOpen,
	resetForm,
	setResetForm,
	passwordError,
	setPasswordError,
	confirmOpen,
	setConfirmOpen,
	onConfirm,
}: Props) {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Reset Password</DialogTitle>
				</DialogHeader>

				<div className='space-y-4'>
					<div className='space-y-1'>
						<Label>New Password</Label>
						<Input
							type='password'
							value={resetForm.password}
							onChange={(e) => {
								setResetForm({ ...resetForm, password: e.target.value })
								setPasswordError('')
							}}
						/>
					</div>

					<div className='space-y-1'>
						<Label>Confirm Password</Label>
						<Input
							type='password'
							value={resetForm.confirm}
							onChange={(e) => {
								setResetForm({ ...resetForm, confirm: e.target.value })
								setPasswordError('')
							}}
						/>

						{passwordError && <p className='text-sm text-red-500'>{passwordError}</p>}
					</div>
				</div>

				<DialogFooter>
					<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<Button
							onClick={() => {
								setPasswordError('')

								if (!resetForm.password || !resetForm.confirm) {
									setPasswordError('All fields are required')
									return
								}

								if (resetForm.password !== resetForm.confirm) {
									setPasswordError('Passwords do not match')
									return
								}

								if (resetForm.password.length < 6) {
									setPasswordError('Password must be at least 6 characters')
									return
								}

								setConfirmOpen(true)
							}}
						>
							Update Password
						</Button>

						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Confirm Password Reset</AlertDialogTitle>
								<AlertDialogDescription>
									This will update the user’s password.
								</AlertDialogDescription>
							</AlertDialogHeader>

							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>

								<AlertDialogAction onClick={onConfirm}>
									Confirm
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}