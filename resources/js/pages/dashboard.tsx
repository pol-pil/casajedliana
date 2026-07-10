import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
];

export default function Dashboard() {
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title='Dashboard' />
		</AppLayout>
	);
}
