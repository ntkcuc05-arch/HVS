import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const WeatherEffects = ({ weatherMode }) => {
    const rainDrops = useMemo(() => {
        if (weatherMode !== 'rain') return [];
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            duration: 0.5 + Math.random() * 0.5,
            delay: Math.random() * 2,
            opacity: 0.2 + Math.random() * 0.3
        }));
    }, [weatherMode]);

    if (weatherMode !== 'rain') return null;

    return (
        <div className="weather-overlay rain-overlay">
            {rainDrops.map((drop) => (
                <motion.div
                    key={drop.id}
                    className="rain-drop"
                    style={{
                        left: drop.left,
                        opacity: drop.opacity,
                    }}
                    initial={{ y: -100 }}
                    animate={{ y: '100vh' }}
                    transition={{
                        duration: drop.duration,
                        repeat: Infinity,
                        delay: drop.delay,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export default WeatherEffects;
