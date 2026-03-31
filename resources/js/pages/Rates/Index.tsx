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
import ChargesSection from '@/components/charge-section';
import RatesSection from '@/components/rates-section';
import BookingTypesSection from '@/components/booking-types-section';

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

					<div className='flex-1 flex-col space-y-4'>
						<RatesChart rates={rates} totalBookings={stats.totalBookings} />
						<RatesSection rates={rates} />
					</div>

					<div className='flex flex-1 flex-col gap-4'>
						<ChargesChart />
						<BookingTypesSection bookingTypes={bookingTypes} />
					</div>

					<div className='flex flex-1 flex-col gap-6'>
						<ChargesSection charges={charges} />
					</div>
				</div>
			</div>
		</AppLayout>
	);
}
