import { Cloud, Sun, CloudRain, CloudLightning, CloudSnow, Wind, Droplets } from "lucide-react";
import { motion } from "framer-motion";

// WMO Weather interpretation codes (WW)
const getWeatherIcon = (code) => {
    if (code === 0 || code === 1) return <Sun size={24} className="weather-icon-svg" />;
    if (code === 2 || code === 3) return <Cloud size={24} className="weather-icon-svg" />;
    if ([45, 48].includes(code)) return <Wind size={24} className="weather-icon-svg" />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain size={24} className="weather-icon-svg" />;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow size={24} className="weather-icon-svg" />;
    if ([95, 96, 99].includes(code)) return <CloudLightning size={24} className="weather-icon-svg" />;
    return <Cloud size={24} className="weather-icon-svg" />;
};

const getWeatherDescription = (code) => {
    if (code === 0) return "Nắng đẹp";
    if (code === 1 || code === 2 || code === 3) return "Có mây";
    if ([45, 48].includes(code)) return "Sương mù";
    if ([51, 53, 55].includes(code)) return "Mưa phùn";
    if ([61, 63, 65].includes(code)) return "Mưa rào";
    if ([80, 81, 82].includes(code)) return "Mưa to";
    if ([95, 96, 99].includes(code)) return "Giông bão";
    return "Bình thường";
};

export default function WeatherWidget({ weather }) {
    if (!weather) return null;

    return (
        <motion.div
            className="weather-widget"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
        >
            <div className="weather-glass">
                <div className="weather-main">
                    <div className="weather-icon">
                        {getWeatherIcon(weather.code)}
                    </div>
                    <div className="weather-temp">
                        <span className="temp-value">{weather.temp}°</span>
                    </div>
                </div>
                <div className="weather-details">
                    <span className="weather-desc">{getWeatherDescription(weather.code)}</span>
                    <div className="weather-humidity">
                        <Droplets size={12} />
                        <span>{weather.humidity}%</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
