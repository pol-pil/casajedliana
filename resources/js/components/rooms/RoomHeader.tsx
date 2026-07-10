import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
	search: string
	setSearch: (v: string) => void
	onAdd: () => void
}

export default function RoomHeader({ search, setSearch, onAdd }: Props) {
	return (
		<div className='flex flex-col gap-4 md:flex-row md:justify-between'>
			<h1 className='text-2xl font-semibold'>Room Management</h1>

			<div className='flex items-center gap-3'>
				<Input
					placeholder='Search room number...'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className='max-w-xs'
				/>

				<Button onClick={onAdd}>+ Add Room</Button>
			</div>
		</div>
	)
}