import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Props = {
	name: string
	setName: (v: string) => void

	email: string
	setEmail: (v: string) => void

	role: string
	setRole: (v: string) => void

	password?: string
	setPassword?: (v: string) => void

	confirm?: string
	setConfirm?: (v: string) => void

	showPassword?: boolean

	error?: {
		name?: string
		email?: string
	}
}

export default function UserFormFields({
	name,
	setName,
	email,
	setEmail,
	role,
	setRole,
	password,
	setPassword,
	confirm,
	setConfirm,
	showPassword = false,
	error,
}: Props) {
	return (
		<div className='space-y-4'>
			{/* NAME */}
			<div className='space-y-1'>
				<Label>Name</Label>
				<Input value={name} onChange={(e) => setName(e.target.value)} />
				{error?.name && <p className='text-sm text-red-500'>{error.name}</p>}
			</div>

			{/* EMAIL */}
			<div className='space-y-1'>
				<Label>Email</Label>
				<Input type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
				{error?.email && <p className='text-sm text-red-500'>{error.email}</p>}
			</div>

			{/* ROLE */}
			<div className='space-y-1'>
				<Label>Role</Label>
				<Select value={role} onValueChange={setRole}>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value='admin'>Admin</SelectItem>
						<SelectItem value='frontdesk'>Frontdesk</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* PASSWORD (OPTIONAL) */}
			{showPassword && setPassword && setConfirm && (
				<>
					<div className='space-y-1'>
						<Label>Password</Label>
						<Input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
					</div>

					<div className='space-y-1'>
						<Label>Confirm Password</Label>
						<Input type='password' value={confirm} onChange={(e) => setConfirm(e.target.value)} />
					</div>
				</>
			)}
		</div>
	)
}