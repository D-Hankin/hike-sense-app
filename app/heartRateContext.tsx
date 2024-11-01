import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HeartRateContextType {
    heartRateHistory: number[];
    addHeartRate: (heartRate: number) => void;
    clearHeartRateHistory?: () => void;
}

const HeartRateContext = createContext<HeartRateContextType>({
    heartRateHistory: [],
    addHeartRate: () => {},
    clearHeartRateHistory: () => {},
});

export const HeartRateProvider = ({ children }: { children: ReactNode }) => {
    const [heartRateHistory, setHeartRateHistory] = useState<number[]>([]);

    const addHeartRate = (heartRate: number) => {
        setHeartRateHistory((prev) => [...prev, heartRate]); // Save heart rate to history
    };

    const clearHeartRateHistory = () => {
        setHeartRateHistory([]); // Clear heart rate history
    }

    return (
        <HeartRateContext.Provider value={{ heartRateHistory, addHeartRate }}>
            {children}
        </HeartRateContext.Provider>
    );
};

export const useHeartRateContext = () => useContext(HeartRateContext);
