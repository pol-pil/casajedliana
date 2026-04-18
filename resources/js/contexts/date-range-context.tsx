import { createContext, useContext, useState, ReactNode } from 'react';
import { DateRange } from 'react-day-picker';

type DateRangeContextType = {
    range: DateRange | undefined;
    setRange: (range: DateRange | undefined) => void;
};

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: ReactNode }) {

    const [range, setRange] = useState<DateRange | undefined>(() => {
        const params = new URLSearchParams(window.location.search);

        const start = params.get('start');
        const end = params.get('end');

        // ✅ If URL has dates → use them
        if (start && end) {
            return {
                from: new Date(start),
                to: new Date(end),
            };
        }

        // ✅ fallback only if no params
        return undefined;
    });

    return (
        <DateRangeContext.Provider value={{ range, setRange }}>
            {children}
        </DateRangeContext.Provider>
    );
}

export function useDateRange() {
    const ctx = useContext(DateRangeContext);
    if (!ctx) throw new Error('useDateRange must be used within DateRangeProvider');
    return ctx;
}