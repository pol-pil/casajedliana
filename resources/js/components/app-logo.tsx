import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-sidebar-primary text-white">
                <AppLogoIcon className="size-8 fill-current" />
            </div>

            <div className="flex flex-col text-left">
                <span className="truncate text-xl font-semibold">
                    Casa Jedliana
                </span>
            </div>
        </div>
    );
}
