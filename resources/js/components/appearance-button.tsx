import { Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleButton({
    className = '',
    ...props
}: HTMLAttributes<HTMLButtonElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const isDark = appearance === 'dark';

    const toggleAppearance = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleAppearance}
            className={cn(
                'inline-flex items-center gap-2 rounded-md px-2.5 py-2.5 transition-colors',
                'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700',
                className
            )}
            {...props}
        >
            {isDark ? (
                <>
                    <Sun className="h-4 w-4" />
                </>
            ) : (
                <>
                    <Moon className="h-4 w-4" />
                </>
            )}
        </button>
    );
}