import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import UserFormFields from './UserFormFields'

type Props = {
	open: boolean
	setOpen: (v: boolean) => void

	form: any
	setForm: (v: any) => void

	onSubmit: () => void
}

export default function CreateUserDialog({ open, setOpen, form, setForm, onSubmit }: Props) {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className='mr-2 h-4 w-4' />
					Create User
				</Button>
			</DialogTrigger>

			<DialogContent className='dark:bg-primary-foreground/80 backdrop-blur-xs'>
				<DialogHeader>
					<DialogTitle>Create User</DialogTitle>
				</DialogHeader>

				<UserFormFields
					name={form.name}
					setName={(v) => setForm({ ...form, name: v })}
					email={form.email}
					setEmail={(v) => setForm({ ...form, email: v })}
					role={form.role}
					setRole={(v) => setForm({ ...form, role: v })}
					password={form.password}
					setPassword={(v) => setForm({ ...form, password: v })}
					confirm={form.confirm}
					setConfirm={(v) => setForm({ ...form, confirm: v })}
					showPassword
				/>

				<DialogFooter>
					<Button className='w-full' onClick={onSubmit}>
						Create User
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}