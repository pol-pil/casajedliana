import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import UserActionsMenu from './UserActionsMenu'

type User = {
	id: number
	name: string
	email: string
	role: string
	status: string
}

type Props = {
	users: User[]
	authUserId: number
	getRoleVariant: (role: string) => any
	getStatusVariant: (status: string) => any
	onEdit: (user: User) => void
	onDelete: (user: User) => void
}

export default function UserTable({
	users,
	authUserId,
	getRoleVariant,
	getStatusVariant,
	onEdit,
	onDelete,
}: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>User Management</CardTitle>
			</CardHeader>

			<CardContent className='p-0'>
				<div className='overflow-x-auto'>
					<table className='w-full text-sm'>
						<thead className='bg-muted'>
							<tr>
								<th className='px-4 py-3 text-left'>ID</th>
								<th className='px-4 py-3 text-left'>Name</th>
								<th className='px-4 py-3 text-left'>Email</th>
								<th className='px-4 py-3 text-left'>Role</th>
								<th className='px-4 py-3 text-left'>Status</th>
								<th className='px-4 py-3 text-left'>Action</th>
							</tr>
						</thead>

						<tbody>
							{users.map((user) => (
								<tr key={user.id} className='border-t'>
									<td className='px-4 py-3'>#{user.id}</td>
									<td className='px-4 py-3'>{user.name}</td>
									<td className='px-4 py-3'>{user.email}</td>

									<td className='px-4 py-3'>
										<Badge className='capitalize' variant={getRoleVariant(user.role)}>{user.role}</Badge>
									</td>

									<td className='px-4 py-3'>
										<Badge className='capitalize' variant={getStatusVariant(user.status)}>{user.status}</Badge>
									</td>

									<td className='px-4 py-3'>
										<UserActionsMenu
											user={user}
											authUserId={authUserId}
											onEdit={onEdit}
											onDelete={onDelete}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	)
}