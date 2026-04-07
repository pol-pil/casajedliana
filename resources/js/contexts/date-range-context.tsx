// resources/js/contexts/date-range-context.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { DateRange } from 'react-day-picker';

type DateRangeContextType = {
    range: DateRange | undefined;
    setRange: (range: DateRange | undefined) => void;
};

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: ReactNode }) {
    const [range, setRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
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