import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, CloudRain, CloudSun } from 'lucide-react';

const EnvironmentControls = ({ envMode, setEnvMode, weatherMode, setWeatherMode }) => {
    return (
        <motion.div
            className="env-controls-panel"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1 }}
        >
            <div className="env-control-group">
                <button
                    className={`env-btn ${envMode === 'day' ? 'active' : ''}`}
                    onClick={() => setEnvMode('day')}
                    title="Chế độ Ngày"
                >
                    <Sun size={18} />
                </button>
                <button
                    className={`env-btn ${envMode === 'night' ? 'active' : ''}`}
                    onClick={() => setEnvMode('night')}
                    title="Chế độ Đêm"
                >
                    <Moon size={18} />
                </button>
            </div>

            <div className="env-divider" />

            <div className="env-control-group">
                <button
                    className={`env-btn ${weatherMode === 'sunny' ? 'active' : ''}`}
                    onClick={() => setWeatherMode('sunny')}
                    title="Trời Nắng"
                >
                    <CloudSun size={18} />
                </button>
                <button
                    className={`env-btn ${weatherMode === 'rain' ? 'active' : ''}`}
                    onClick={() => setWeatherMode('rain')}
                    title="Trời Mưa"
                >
                    <CloudRain size={18} />
                </button>
            </div>
        </motion.div>
    );
};

export default EnvironmentControls;
