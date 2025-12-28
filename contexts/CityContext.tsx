'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

import { City, cities } from '../utils/cityUtils';

interface CityContextType {
    selectedCity: City | null;
    setSelectedCity: (city: City | null) => void;
    cities: City[];
}

const CityContext = createContext<CityContextType | undefined>(undefined);


export function CityProvider({ children }: { children: ReactNode }) {
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    return (
        <CityContext.Provider value={{ selectedCity, setSelectedCity, cities }}>
            {children}
        </CityContext.Provider>
    );
}

export function useCity() {
    const context = useContext(CityContext);
    if (context === undefined) {
        throw new Error('useCity must be used within a CityProvider');
    }
    return context;
}
