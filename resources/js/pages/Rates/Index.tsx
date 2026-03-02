import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import {
	CheckCircleIcon,
	ClockIcon,
	UserIcon,
	PhilippinePeso,
	Plus,
	EditIcon,
	TrashIcon,
	MoreHorizontalIcon,
	Tickets,
	PackagePlus,
} from 'lucide-react';
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from '@/components/ui/field';
import { useState, useEffect, use } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RatesChart } from '@/components/rates-chart';
import { ChargesChart } from '@/components/charges-chart';

type Rate = {
	id: number;
	name: string;
	value: number;
	type: 'fixed' | 'percentage';
};

type Charge = {
	id: number;
	name: string;
	value: number;
	type: 'amenity' | 'damage';
};

type BookingType = {
	id: number;
	name: string;
};

type Stats = {
	totalBookings: number;
};

type PageData = {
	rates: Rate[];
	charges: Charge[];
	bookingTypes: BookingType[];
	stats: Stats;
};

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Configurations',
		href: '/rates',
	},
];

export default function Index() {
	const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
	const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false);
	const [isBookingTypeDialogOpen, setIsBookingTypeDialogOpen] = useState(false);
	const [editingRate, setEditingRate] = useState<Rate | null>(null);
	const [editingCharge, setEditingCharge] = useState<Charge | null>(null);
	const [editingBookingType, setEditingBookingType] = useState<BookingType | null>(null);

	const { rates, charges, bookingTypes, stats } = usePage().props as unknown as {
		rates: Rate[];
		charges: Charge[];
		bookingTypes: BookingType[];
		stats: Stats;
	};
	// Rate Form
	const {
		data: rateData,
		setData: setRateData,
		post: postRate,
		put: putRate,
		processing: rateProcessing,
		reset: resetRateForm,
		errors: rateErrors,
	} = useForm({
		name: '',
		value: '',
		type: 'fixed',
	});

	// Charge Form
	const {
		data: chargeData,
		setData: setChargeData,
		post: postCharge,
		put: putCharge,
		processing: chargeProcessing,
		reset: resetChargeForm,
		errors: chargeErrors,
	} = useForm({
		name: '',
		value: '',
		type: 'amenity',
	});

	//Booking Type Form
	const {
		data: bookingTypeData,
		setData: setBookingTypeData,
		post: postBookingType,
		put: putBookingType,
		processing: bookingTypeProcessing,
		reset: resetBookingTypeForm,
		errors: bookingTypeErrors,
	} = useForm({
		name: '',
	});

	useEffect(() => {
		if (editingRate) {
			setRateData({
				name: editingRate.name,
				value: editingRate.value.toString(),
				type: editingRate.type,
			});
		}
	}, [editingRate]);

	useEffect(() => {
		if (editingCharge) {
			setChargeData({
				name: editingCharge.name,
				value: editingCharge.value.toString(),
				type: editingCharge.type,
			});
		}
	}, [editingCharge]);

	useEffect(() => {
		if (editingBookingType) {
			setBookingTypeData({
				name: editingBookingType.name,
			});
		}
	}, [editingBookingType]);

	const handleRateSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (editingRate) {
			putRate(`/rates/${editingRate.id}`, {
				onSuccess: () => {
					setIsRateDialogOpen(false);
					setEditingRate(null);
					resetRateForm();
				},
			});
		} else {
			postRate(`/rates`, {
				onSuccess: () => {
					setIsRateDialogOpen(false);
					resetRateForm();
				},
			});
		}
	};

	const handleChargeSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (editingCharge) {
			putCharge(`/charges/${editingCharge.id}`, {
				onSuccess: () => {
					setIsChargeDialogOpen(false);
					setEditingCharge(null);
					resetChargeForm();
				},
			});
		} else {
			postCharge(`/charges`, {
				onSuccess: () => {
					setIsChargeDialogOpen(false);
					resetChargeForm();
				},
			});
		}
	};

	const handleBookingTypeSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (editingBookingType) {
			putBookingType(`/booking-types/${editingBookingType?.id}`, {
				onSuccess: () => {
					setIsBookingTypeDialogOpen(false);
					setEditingBookingType(null);
					resetBookingTypeForm();
				},
			});
		} else {
			postBookingType(`/booking-types`, {
				onSuccess: () => {
					setIsBookingTypeDialogOpen(false);
					resetBookingTypeForm();
				},
			});
		}
	};

	const handleDeleteRate = (rateId: number) => {
		if (confirm('Are you sure you want to delete this rate?')) {
			router.delete(`/rates/${rateId}`);
		}
	};

	const handleDeleteCharge = (chargeId: number) => {
		if (confirm('Are you sure you want to delete this charge?')) {
			router.delete(`/charges/${chargeId}`);
		}
	};

	const handleDeleteBookingType = (bookingTypeId: number) => {
		if (confirm('Are you sure you want to delete this booking type?')) {
			router.delete(`/booking-types/${bookingTypeId}`);
		}
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			minimumFractionDigits: 2,
		}).format(value);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<div className='h-full xl:flex'>
				<div className='flex flex-1 gap-4 px-8 py-4'>
				<Head title='Configurations' />

				<div className='flex-1 flex-col gap-4'>
					<RatesChart rates={rates} totalBookings={stats.totalBookings} />
					{/* Rates Table */}
					<div className='rounded-lg border mt-4'>
						<div className='flex flex-row items-center justify-between border-b p-4'>
							<h2 className='text-lg font-semibold'>Rates ({rates.length})</h2>
							<Dialog
								open={isRateDialogOpen}
								onOpenChange={(open) => {
									setIsRateDialogOpen(open);
									if (!open) {
										setEditingRate(null);
										resetRateForm();
									}
								}}
							>
								<DialogTrigger asChild>
									<Button className='flex items-center'>
										<Plus className='size-4' />
										Add Rate
									</Button>
								</DialogTrigger>
								<DialogContent className='max-h-[90vh] min-w-[90vw] lg:min-w-md'>
									<form onSubmit={handleRateSubmit}>
										<FieldGroup>
											<FieldSet>
												<FieldLegend>{editingRate ? 'Edit Rate' : 'New Rate'}</FieldLegend>
												<FieldSeparator />
												<Field>
													<FieldLabel htmlFor='rate-name'>Rate Name</FieldLabel>
													<Input
														id='rate-name'
														type='text'
														maxLength={100}
														required
														value={rateData.name}
														onChange={(e) => setRateData('name', e.target.value)}
													/>
												</Field>
												<FieldGroup className='grid grid-cols-2 gap-4'>
													<Field>
														<FieldLabel htmlFor='rate-value'>Value</FieldLabel>
														<Input
															id='rate-value'
															type='number'
															step='0.01'
															min='0'
															required
															value={rateData.value}
															onChange={(e) => setRateData('value', e.target.value)}
														/>
													</Field>
													<Field>
														<FieldLabel htmlFor='rate-type'>Type</FieldLabel>
														<Select
															value={rateData.type}
															onValueChange={(value: 'fixed' | 'percentage') => setRateData('type', value)}
														>
															<SelectTrigger>
																<SelectValue placeholder='Select type' />
															</SelectTrigger>
															<SelectContent>
																<SelectGroup>
																	<SelectItem value='fixed'>Fixed Amount</SelectItem>
																	<SelectItem value='percentage'>Percentage</SelectItem>
																</SelectGroup>
															</SelectContent>
														</Select>
													</Field>
												</FieldGroup>
											</FieldSet>
										</FieldGroup>
										<FieldSeparator className='py-8' />
										<DialogFooter>
											<DialogClose asChild>
												<Button type='button' variant='outline'>
													Cancel
												</Button>
											</DialogClose>
											<Button type='submit' disabled={rateProcessing}>
												{rateProcessing ? 'Saving...' : editingRate ? 'Update Rate' : 'Add Rate'}
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						</div>
						<div className='h-full overflow-auto px-2'>
							<Table>
								<TableBody>
									<ScrollArea className='h-115'>
										{rates.map((rate: any) => (
											<TableRow key={rate.id}>
												<TableCell className='w-full font-medium break-words whitespace-normal'>
													{rate.name}
												</TableCell>
												<TableCell className='text-right'>
													{rate.type === 'fixed' ? formatCurrency(rate.value) : `${rate.value}%`}
												</TableCell>
												<TableCell className='flex justify-end'>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant='ghost' size='icon'>
																<MoreHorizontalIcon className='size-4' />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align='end'>
															<DropdownMenuItem
																onClick={() => {
																	setEditingRate(rate);
																	setIsRateDialogOpen(true);
																}}
															>
																<EditIcon className='mr-2 size-4' />
																Edit
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																className='text-destructive'
																onClick={() => handleDeleteRate(rate.id)}
															>
																<TrashIcon className='mr-2 size-4' />
																Delete
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
										{rates.length === 0 && (
											<TableRow>
												<TableCell colSpan={4} className='py-8 text-center text-muted-foreground'>
													No rates found.
												</TableCell>
											</TableRow>
										)}
									</ScrollArea>
								</TableBody>
							</Table>
						</div>
					</div>
				</div>

				<div className='flex flex-1 flex-col gap-4'>
					{/* Charges Table */}
					<ChargesChart />

					<div className='h-132 rounded-lg border'>
						<div className='flex flex-row items-center justify-between border-b p-4'>
							<h2 className='text-lg font-semibold'>Booking Types ({bookingTypes.length})</h2>
							<Dialog
								open={isBookingTypeDialogOpen}
								onOpenChange={(open) => {
									setIsBookingTypeDialogOpen(open);
									if (!open) {
										setEditingBookingType(null);
										resetBookingTypeForm();
									}
								}}
							>
								<DialogTrigger asChild>
									<Button className='flex items-center'>
										<Plus className='size-4' />
										Add Booking Type
									</Button>
								</DialogTrigger>
								<DialogContent className='max-h-[90vh] min-w-[90vw] overflow-y-auto lg:min-w-md'>
									<form onSubmit={handleBookingTypeSubmit}>
										<FieldGroup>
											<FieldSet>
												<FieldLegend>{editingBookingType ? 'Edit Booking Type' : 'New Booking Type'}</FieldLegend>
												<FieldSeparator />
												<Field>
													<FieldLabel htmlFor='booking-type-name'>Booking Type Name</FieldLabel>
													<Input
														id='booking-type-name'
														type='text'
														maxLength={100}
														required
														value={bookingTypeData.name}
														onChange={(e) => setBookingTypeData('name', e.target.value)}
													/>
												</Field>
											</FieldSet>
										</FieldGroup>
										<FieldSeparator className='py-8' />
										<DialogFooter>
											<DialogClose asChild>
												<Button type='button' variant='outline'>
													Cancel
												</Button>
											</DialogClose>
											<Button type='submit' disabled={bookingTypeProcessing}>
												{bookingTypeProcessing
													? 'Saving...'
													: editingBookingType
														? 'Update Booking Type'
														: 'Add Booking Type'}
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						</div>
						<div className='overflow-auto px-2'>
							<Table>
								<TableBody>
									{bookingTypes.map((booking_type: any) => (
										<TableRow key={booking_type.id}>
											<TableCell className='w-full font-medium break-words whitespace-normal'>
												{booking_type.name}
											</TableCell>
											<TableCell className='flex justify-end'>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' size='icon'>
															<MoreHorizontalIcon className='size-4' />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuItem
															onClick={() => {
																setEditingBookingType(booking_type);
																setIsBookingTypeDialogOpen(true);
															}}
														>
															<EditIcon className='mr-2 size-4' />
															Edit
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className='text-destructive'
															onClick={() => handleDeleteBookingType(booking_type.id)}
														>
															<TrashIcon className='mr-2 size-4' />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
									{bookingTypes.length === 0 && (
										<TableRow>
											<TableCell colSpan={4} className='py-8 text-center text-muted-foreground'>
												No booking type found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					</div>
				</div>

				{/* Booking Types */}
				<div className='flex flex-1 flex-col gap-6'>
					<div className='rounded-lg border'>
						<div className='flex flex-row items-center justify-between border-b p-4'>
							<h2 className='text-lg font-semibold'>Charges</h2>
							<Dialog
								open={isChargeDialogOpen}
								onOpenChange={(open) => {
									setIsChargeDialogOpen(open);
									if (!open) {
										setEditingCharge(null);
										resetChargeForm();
									}
								}}
							>
								<DialogTrigger asChild>
									<Button className='flex items-center'>
										<Plus className='size-4' />
										Add Charge
									</Button>
								</DialogTrigger>
								<DialogContent className='max-h-[90vh] min-w-[90vw] overflow-y-auto lg:min-w-md'>
									<form onSubmit={handleChargeSubmit}>
										<FieldGroup>
											<FieldSet>
												<FieldLegend>{editingCharge ? 'Edit Charge' : 'New Charge'}</FieldLegend>
												<FieldSeparator />
												<Field>
													<FieldLabel htmlFor='charge-name'>Charge Name</FieldLabel>
													<Input
														id='charge-name'
														type='text'
														maxLength={100}
														required
														value={chargeData.name}
														onChange={(e) => setChargeData('name', e.target.value)}
													/>
												</Field>
												<FieldGroup className='grid grid-cols-2 gap-4'>
													<Field>
														<FieldLabel htmlFor='charge-value'>Value</FieldLabel>
														<Input
															id='charge-value'
															type='number'
															step='0.01'
															min='0'
															required
															value={chargeData.value}
															onChange={(e) => setChargeData('value', e.target.value)}
														/>
													</Field>
													<Field>
														<FieldLabel htmlFor='charge-type'>Type</FieldLabel>
														<Select
															value={chargeData.type}
															onValueChange={(value: 'amenity' | 'damage') => setChargeData('type', value)}
														>
															<SelectTrigger>
																<SelectValue placeholder='Select type' />
															</SelectTrigger>
															<SelectContent>
																<SelectGroup>
																	<SelectItem value='amenity'>Amenity</SelectItem>
																	<SelectItem value='damage'>Damage</SelectItem>
																</SelectGroup>
															</SelectContent>
														</Select>
													</Field>
												</FieldGroup>
											</FieldSet>
										</FieldGroup>
										<FieldSeparator className='py-8' />
										<DialogFooter>
											<DialogClose asChild>
												<Button type='button' variant='outline'>
													Cancel
												</Button>
											</DialogClose>
											<Button type='submit' disabled={chargeProcessing}>
												{chargeProcessing ? 'Saving...' : editingCharge ? 'Update Charge' : 'Save Charge'}
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						</div>
						<div className='overflow-auto px-2'>
							<Table>
								<TableBody>
									<p className='py-4 pl-2 text-gray-500'>
										Amenities ({charges.filter((charge: any) => charge.type === 'amenity').length})
									</p>
									<ScrollArea className='h-90'>
										{charges
											.filter((charge: any) => charge.type === 'amenity')
											.map((charge: any) => (
												<TableRow key={charge.id}>
													<TableCell className='w-full font-medium break-words whitespace-normal'>
														{charge.name}
													</TableCell>
													<TableCell className='text-right'>{formatCurrency(charge.value)}</TableCell>
													<TableCell className='flex justify-end'>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant='ghost' size='icon'>
																	<MoreHorizontalIcon className='size-4' />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align='end'>
																<DropdownMenuItem
																	onClick={() => {
																		setEditingCharge(charge);
																		setIsChargeDialogOpen(true);
																	}}
																>
																	<EditIcon className='mr-2 size-4' />
																	Edit
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	className='text-destructive'
																	onClick={() => handleDeleteCharge(charge.id)}
																>
																	<TrashIcon className='mr-2 size-4' />
																	Delete
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											))}
									</ScrollArea>
									<Separator />
									<p className='py-4 pl-2 text-gray-500'>
										Room Damage ({charges.filter((charge: any) => charge.type === 'damage').length})
									</p>
									<ScrollArea className='h-90'>
										{charges
											.filter((charge: any) => charge.type === 'damage')
											.map((charge: any) => (
												<TableRow key={charge.id}>
													<TableCell className='w-full font-medium break-words whitespace-normal'>
														{charge.name}
													</TableCell>
													<TableCell className='text-right'>{formatCurrency(charge.value)}</TableCell>
													<TableCell className='flex justify-end'>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant='ghost' size='icon'>
																	<MoreHorizontalIcon className='size-4' />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align='end'>
																<DropdownMenuItem
																	onClick={() => {
																		setEditingCharge(charge);
																		setIsChargeDialogOpen(true);
																	}}
																>
																	<EditIcon className='mr-2 size-4' />
																	Edit
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	className='text-destructive'
																	onClick={() => handleDeleteCharge(charge.id)}
																>
																	<TrashIcon className='mr-2 size-4' />
																	Delete
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											))}
										{charges.length === 0 && (
											<TableRow>
												<TableCell colSpan={4} className='py-8 text-center text-muted-foreground'>
													No charges found.
												</TableCell>
											</TableRow>
										)}
									</ScrollArea>
								</TableBody>
							</Table>
						</div>
					</div>
				</div>
				</div>
			</div>
		</AppLayout>
	);
}
