import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthImageCardLayout({
	children,
	title,
	description,
}: PropsWithChildren<{
	name?: string;
	title?: string;
	description?: string;
}>) {
	return (
		<div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
			<div className='flex w-full max-w-md flex-col gap-6'>
				<Link href={home()} className='flex-1 items-center gap-2 self-center font-medium'>
					<div className='flex h-9 w-9 items-center justify-center'>
						<AppLogoIcon className='size-9 fill-current text-black dark:text-white' />
					</div>
				</Link>

				<div className='flex-1 flex-col gap-6 w-200'>
					<Card className='flex-row overflow-hidden rounded-xl'>
						{/* Left: Image */}
						<div className='flex-1'>
							<img src='/bg.png' alt='Preview' className='h-full w-full object-cover' />
						</div>

						{/* Right: Content */}
						<div className='flex-1 flex-col'>
							<CardHeader className='px-10 pt-8 pb-0 text-left'>
								<CardTitle className='text-xl'>{title}</CardTitle>
								<CardDescription>{description}</CardDescription>
							</CardHeader>

							<CardContent className='px-10 py-8'>{children}</CardContent>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
