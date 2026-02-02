import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to determine background style based on day/night and weather
const getBackgroundGradient = (isDay, weatherCode) => {
    // Rain/Storm (Grayish)
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode)) {
        return isDay
            ? "linear-gradient(to bottom, #4b6cb7, #182848)" // Rainy Day
            : "linear-gradient(to bottom, #232526, #414345)"; // Rainy Night
    }

    // Sunny/Clear
    if (isDay) {
        return "linear-gradient(to bottom, #2980b9, #6dd5fa, #ffffff)"; // Clear Day (Blue Sky)
    } else {
        return "linear-gradient(to bottom, #0f2027, #203a43, #2c5364)"; // Clear Night (Deep Blue/Black)
    }
};

export default function WeatherBackground({ weather }) {
    if (!weather) return null;

    const { is_day, weather_code } = weather;
    const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather_code);
    const isCloudy = [1, 2, 3, 45, 48].includes(weather_code);
    const isClear = weather_code === 0;

    return (
        <div className="weather-bg-layer" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>

            {/* 1. Dynamic Gradient Overlay - Smooth transition */}
            <motion.div
                className="sky-gradient"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8, background: getBackgroundGradient(is_day, weather_code) }}
                transition={{ duration: 2 }}
                style={{ position: 'absolute', inset: 0 }}
            />

            {/* 2. Celestial Bodies (Sun/Moon) */}
            <AnimatePresence mode="wait">
                {is_day && (isClear || isCloudy) && !isRainy && (
                    <motion.div
                        key="sun"
                        className="celestial-sun"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ duration: 1.5, type: "spring" }}
                        style={{
                            position: 'absolute',
                            top: '10%',
                            right: '25%',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: '#FDB813',
                            boxShadow: '0 0 60px #FDB813, 0 0 100px rgba(253, 184, 19, 0.4)',
                            zIndex: 1
                        }}
                    />
                )}

                {!is_day && (
                    <motion.div
                        key="moon"
                        className="celestial-moon"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        style={{
                            position: 'absolute',
                            top: '10%',
                            right: '20%',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#F4F6F0',
                            boxShadow: '0 0 20px #F4F6F0',
                            zIndex: 1
                        }}
                    />
                )}
            </AnimatePresence>

            {/* 3. Rain Effect */}
            {isRainy && (
                <div className="rain-container">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="rain-drop" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${0.5 + Math.random() * 0.5}s`
                        }} />
                    ))}
                </div>
            )}

            {/* 4. Clouds (CSS Shapes) */}
            {(isCloudy || isRainy) && (
                <div className="clouds-container">
                    <motion.div
                        className="cloud cloud-1"
                        animate={{ x: [0, 50, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="cloud cloud-2"
                        animate={{ x: [0, -30, 0] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            )}

            {/* 5. Stars (Night only, Clear) */}
            {!is_day && !isRainy && !isCloudy && (
                <div className="stars-container">
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className="star" style={{
                            top: `${Math.random() * 60}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`
                        }} />
                    ))}
                </div>
            )}
        </div>
    );
}
