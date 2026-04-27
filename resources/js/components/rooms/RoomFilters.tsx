import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Props = {
	activeCategory: any
	setActiveCategory: (v: any) => void
	activeStatus: any
	setActiveStatus: (v: any) => void
}

export default function RoomFilters({
	activeCategory,
	setActiveCategory,
	activeStatus,
	setActiveStatus,
}: Props) {
	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-center'>
			<div className='w-full md:w-60'>
				<Select value={activeCategory} onValueChange={setActiveCategory}>
					<SelectTrigger>
						<SelectValue placeholder='Filter by Room Type' />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value='All'>All Types</SelectItem>
						<SelectItem value='Standard'>Standard</SelectItem>
						<SelectItem value='Suite'>Suite</SelectItem>
						<SelectItem value='Quadro'>Quadro</SelectItem>
						<SelectItem value='Family'>Family</SelectItem>
						<SelectItem value='Penthouse'>Pent House</SelectItem>
						<SelectItem value='Resthouse'>Rest House</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className='inline-flex items-center rounded-xl border bg-muted p-1'>
				{(['All', 'Available', 'Occupied', 'Reserved', 'Maintenance'] as const).map((status) => {
					const isActive = activeStatus === status

					return (
						<button
							key={status}
							onClick={() => setActiveStatus(status)}
							className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
								isActive ? 'shadow-sm' : 'text-muted-foreground'
							}`}
						>
							{status}
						</button>
					)
				})}
			</div>
		</div>
	)
}
