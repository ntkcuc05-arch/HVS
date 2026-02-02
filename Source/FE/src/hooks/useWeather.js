import { useState, useEffect } from "react";

export function useWeather() {
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        // Coordinates for Hanoi, Vietnam
        const latitude = 21.0285;
        const longitude = 105.8542;

        const fetchWeather = async () => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,is_day&timezone=Asia%2FBangkok`
                );
                if (!response.ok) throw new Error("Weather fetch failed");
                const data = await response.json();

                if (data.current) {
                    setWeather({
                        temp: Math.round(data.current.temperature_2m),
                        humidity: data.current.relative_humidity_2m,
                        code: data.current.weather_code,
                        is_day: data.current.is_day === 1
                    });
                }
            } catch (error) {
                console.error("Failed to fetch weather", error);
            }
        };

        fetchWeather();
        // Refresh every 30 minutes
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return weather;
}
