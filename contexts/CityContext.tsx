'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { City, cities, slugToCity, cityToSlug } from '../utils/cityUtils';

const STORAGE_KEY = 'biletlink_selected_city';

interface CityContextType {
    selectedCity: City | null;
    setSelectedCity: (city: City | null) => void;
    cities: City[];
    isLoading: boolean; // true while checking localStorage
    hasEverSelectedCity: boolean; // true if user has selected a city before
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: ReactNode }) {
    const [selectedCity, setSelectedCityState] = useState<City | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasEverSelectedCity, setHasEverSelectedCity] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const citySlug = JSON.parse(saved);
                const city = slugToCity(citySlug);
                if (city) {
                    setSelectedCityState(city);
                    setHasEverSelectedCity(true);
                }
            }
        } catch (e) {
            console.error('Failed to load city from localStorage:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Wrapper to save to localStorage when city changes
    const setSelectedCity = (city: City | null) => {
        setSelectedCityState(city);
        if (city) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cityToSlug(city.name)));
                setHasEverSelectedCity(true);
            } catch (e) {
                console.error('Failed to save city to localStorage:', e);
            }
        } else {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) {
                console.error('Failed to remove city from localStorage:', e);
            }
        }
    };

    return (
        <CityContext.Provider value={{
            selectedCity,
            setSelectedCity,
            cities,
            isLoading,
            hasEverSelectedCity
        }}>
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
