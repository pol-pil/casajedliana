import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Card, CardHeader } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AtSign, CircleUserRound, MapPin, Phone, Plus } from 'lucide-react';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Dashboard',
		href: dashboard().url,
	},
];

export default function Dashboard() {
	const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title='Dashboard' />
		</AppLayout>
	);
}
