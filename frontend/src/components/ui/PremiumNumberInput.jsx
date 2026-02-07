
import React, { useRef, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

const PremiumNumberInput = ({ value, onChange, step = 1, min = 0, className = '', label = '' }) => {
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    const updateValue = (direction) => {
        const currentVal = parseFloat(value) || 0;
        const newVal = Math.max(min, currentVal + (direction * step));
        // Use a synthetic event to match standard onChange expectation if needed, or direct value
        onChange({ target: { value: parseFloat(newVal.toFixed(2)) } });
    };

    const startSpin = (direction) => {
        updateValue(direction); // Immediate update
        // Initial delay before rapid spin
        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                updateValue(direction);
            }, 100); // Spin speed
        }, 400); // Delay before spin
    };

    const stopSpin = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopSpin();
    }, []);

    return (
        <div className={`flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 ${className}`}>
            <button 
                onMouseDown={() => startSpin(-1)}
                onMouseUp={stopSpin}
                onMouseLeave={stopSpin}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                type="button"
            >
                <Minus size={10} />
            </button>
            <input 
                type="number" 
                value={value} 
                onChange={onChange}
                step={step}
                className="bg-transparent text-center w-full outline-none text-xs font-mono font-bold text-white appearance-none" 
                style={{ MozAppearance: 'textfield' }} // Hide Firefox spinners
            />
            {label && <span className="text-[8px] text-gray-500 font-bold pr-1">{label}</span>}
            <button 
                onMouseDown={() => startSpin(1)}
                onMouseUp={stopSpin}
                onMouseLeave={stopSpin}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                type="button"
            >
                <Plus size={10} />
            </button>
            <style jsx>{`
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

export default PremiumNumberInput;
