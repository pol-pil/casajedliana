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
		<div className="flex min-h-svh flex-col items-center justify-center bg-[url('/login.png')] bg-cover bg-center p-6 md:p-10 dark:bg-neutral-950 dark:bg-none">
			<div className='flex w-full max-w-5xl flex-col'>
				<Card className='flex h-180 flex-col gap-0 overflow-hidden rounded-xl p-0 md:flex-row'>
					<div className='hidden min-h-64 md:block md:w-1/2'>
						<img src='/bg.png' alt='Preview' className='h-full w-full object-cover' />
					</div>

					<div className='relative flex flex-col justify-center md:w-1/2'>
						<div className='pointer-events-none absolute top-0 left-0 z-0 h-84 w-full bg-gradient-to-b from-black/5 to-transparent dark:from-black/50' />
						<Link href={home()} className='z-10 flex items-center gap-2 self-center font-medium'>
							<div className='flex size-60 items-center justify-center'>
								<img src='/logogold.png' alt='Preview' className='hidden dark:block' />
								<img src='/logodark.png' alt='Preview' className='dark:hidden' />
							</div>
						</Link>
						<CardHeader className='px-14 pt-8 pb-0 text-left'>
							<CardTitle className='text-xl'>{title}</CardTitle>
							<CardDescription>{description}</CardDescription>
						</CardHeader>

						<CardContent className='px-14 py-8'>{children}</CardContent>
					</div>
				</Card>
			</div>
		</div>
	);
}
