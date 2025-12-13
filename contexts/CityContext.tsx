'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CityContextType {
    selectedCity: string;
    setSelectedCity: (city: string) => void;
    cities: string[];
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const cities = [
    'Tüm Şehirler',
    'İstanbul',
    'Ankara',
    'İzmir',
    'Bursa',
    'Antalya',
    'Adana',
    'Konya',
    'Gaziantep',
    'Sinop',
    'Eskişehir',
    'Mersin',
    'Kayseri',
    'Trabzon',
    'Samsun',
    'Denizli',
    'Muğla'
];

export function CityProvider({ children }: { children: ReactNode }) {
    const [selectedCity, setSelectedCity] = useState('Tüm Şehirler');

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
