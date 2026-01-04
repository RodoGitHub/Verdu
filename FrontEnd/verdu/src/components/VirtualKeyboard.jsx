import React, { useState } from 'react';
import { X, Delete, ArrowBigUp } from 'lucide-react';

const VirtualKeyboard = ({ onKeyPress, onBackspace, onClose, value = '', isPassword = false }) => {

    const [isShift, setIsShift] = useState(false);

    const getChar = (char) => isShift ? char.toUpperCase() : char.toLowerCase();

    const handleKey = (key) => {
        onKeyPress(key);
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700 select-none">

            <div className="flex justify-between items-center mb-4 gap-4">
                {/* Input Display Area */}
                <div className="flex-1 h-16 bg-white dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 flex items-center px-4 shadow-inner overflow-hidden">
                    <span className="text-3xl font-mono text-gray-800 dark:text-gray-100 tracking-wider">
                        {isPassword ? '•'.repeat(value.length) : (value || <span className="opacity-30">Ingresa texto...</span>)}
                    </span>
                    <span className="animate-pulse w-1 h-8 bg-green-500 ml-1"></span>
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 bg-gray-200 dark:bg-gray-700 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all shadow-sm"
                >
                    <X className="w-8 h-8" />
                </button>
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-10 gap-2 mb-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(char => (
                    <button
                        type="button"
                        key={char}
                        onClick={() => handleKey(char)}
                        className="h-20 bg-white hover:bg-gray-200 rounded-lg font-bold text-3xl dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 shadow-sm active:scale-95 transition-all text-gray-700"
                    >
                        {char}
                    </button>
                ))}
            </div>

            {/* QWERTY Row 1 */}
            <div className="grid grid-cols-10 gap-2 mb-4">
                {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(char => (
                    <button
                        type="button"
                        key={char}
                        onClick={() => handleKey(getChar(char))}
                        className="h-20 bg-white hover:bg-gray-200 rounded-lg font-bold text-2xl dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 shadow-sm active:scale-95 transition-all text-gray-700"
                    >
                        {getChar(char)}
                    </button>
                ))}
            </div>

            {/* QWERTY Row 2 */}
            <div className="grid grid-cols-10 gap-2 mb-4">
                {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'].map(char => (
                    <button
                        type="button"
                        key={char}
                        onClick={() => handleKey(getChar(char))}
                        className="h-20 bg-white hover:bg-gray-200 rounded-lg font-bold text-2xl dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 shadow-sm active:scale-95 transition-all text-gray-700"
                    >
                        {getChar(char)}
                    </button>
                ))}
            </div>

            {/* QWERTY Row 3 */}
            <div className="grid grid-cols-9 gap-2 mb-8 px-4">
                <button
                    type="button"
                    onClick={() => setIsShift(!isShift)}
                    className={`h-20 rounded-lg font-bold text-2xl shadow-sm active:scale-95 transition-all flex items-center justify-center ${isShift ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-white'}`}
                >
                    <ArrowBigUp className={`w-10 h-10 ${isShift ? 'fill-current' : ''}`} />
                </button>
                {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map(char => (
                    <button
                        type="button"
                        key={char}
                        onClick={() => handleKey(getChar(char))}
                        className="h-20 bg-white hover:bg-gray-200 rounded-lg font-bold text-2xl dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 shadow-sm active:scale-95 transition-all text-gray-700"
                    >
                        {getChar(char)}
                    </button>
                ))}
                <div className="hidden"></div>
            </div>

            {/* Bottom Controls */}
            <div className="grid grid-cols-4 gap-4">
                <button type="button" onClick={() => handleKey('_')} className="h-24 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-2xl dark:bg-gray-600 dark:text-white active:scale-95 text-gray-700">_</button>
                <button type="button" onClick={() => handleKey(' ')} className="h-24 col-span-2 bg-white hover:bg-gray-200 rounded-lg font-bold text-2xl dark:bg-gray-700 dark:text-white active:scale-95 shadow-sm text-gray-700">ESPACIO</button>
                <button type="button" onClick={onBackspace} className="h-24 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-bold dark:bg-red-900/30 dark:text-red-400 active:scale-95 flex items-center justify-center">
                    <Delete className="w-12 h-12" />
                </button>
            </div>
        </div>
    );
};

export default VirtualKeyboard;
