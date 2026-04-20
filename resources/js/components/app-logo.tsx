import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { hotel } = usePage().props as any;

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center justify-center overflow-hidden">
                {hotel?.logo ? (
                    <img
                        src={`/storage/${hotel.logo}`}
                        className="h-10 w-10 object-contain"
                    />
                ) : (
                    <AppLogoIcon className="size-8 fill-current text-white" />
                )}
            </div>

            <div className="flex flex-col text-left">
                <span className="truncate text-xl font-semibold">
                    {hotel?.hotel_name || 'Hotel Name'}
                </span>
            </div>
        </div>
    );
}