import React from 'react';
import { ArrowRight } from 'lucide-react';

const PinPad = ({
    value = '',
    onChange,
    onSubmit,
    error = null,
    maxLength = 8
}) => {

    const handleInput = (num) => {
        if (value.length < maxLength) {
            onChange(value + num);
        }
    };

    const handleDelete = () => {
        onChange(value.slice(0, -1));
    };

    return (
        <div className="w-full max-w-md flex flex-col items-center animate-[fadeIn_0.2s]">
            {/* PIN Display */}
            <div className="w-full h-24 bg-gray-800 rounded-2xl mb-8 flex items-center justify-center text-5xl tracking-[0.5em] font-mono text-white border border-gray-700 shadow-inner">
                {value ? Array(value.length).fill('•').join('') : <span className="text-gray-600 text-lg tracking-normal">_ _ _ _</span>}
            </div>

            {error && <p className="text-red-400 text-sm mb-4 animate-pulse text-center">{error}</p>}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-5 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        type="button"
                        key={num}
                        onClick={() => handleInput(num.toString())}
                        className="h-24 rounded-2xl bg-gray-800 text-white text-4xl font-bold hover:bg-gray-700 active:bg-green-600 active:scale-95 transition-all shadow-lg border border-gray-700"
                    >
                        {num}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={handleDelete}
                    className="h-24 rounded-2xl bg-red-900/30 text-red-400 text-3xl font-bold hover:bg-red-900/50 active:scale-95 transition-all border border-red-900/50 flex items-center justify-center"
                >
                    <span className="text-4xl">⌫</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleInput('0')}
                    className="h-24 rounded-2xl bg-gray-800 text-white text-4xl font-bold hover:bg-gray-700 active:bg-green-600 active:scale-95 transition-all shadow-lg border border-gray-700"
                >
                    0
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    className="h-24 rounded-2xl bg-green-600 text-white text-3xl font-bold hover:bg-green-500 active:scale-95 transition-all shadow-lg shadow-green-900/40 flex items-center justify-center"
                >
                    <ArrowRight className="w-12 h-12" />
                </button>
            </div>
        </div>
    );
};

export default PinPad;
