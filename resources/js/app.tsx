// app.tsx
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';
import { Toaster } from 'sonner';
import { DateRangeProvider } from '@/contexts/date-range-context';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <DateRangeProvider>
                    <Toaster position='bottom-right' />
                    <App {...props} />
                </DateRangeProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4b634b',
    },
});

initializeTheme();