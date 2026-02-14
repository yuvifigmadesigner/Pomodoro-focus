import React, { useState, useRef } from 'react';
import { TimerSettings } from '../types';
import { X, ChevronUp, ChevronDown, Clock, Move, Upload, Ban } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: TimerSettings;
    onUpdateSettings: (newSettings: TimerSettings) => void;
    currentBackground: string;
    onUpdateBackground: (bg: string) => void;
    currentBgPosition: { x: number; y: number };
    onUpdateBgPosition: (pos: { x: number; y: number }) => void;
    currentBezelColor: string;
    onUpdateBezelColor: (color: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    settings,
    onUpdateSettings,
    currentBackground,
    onUpdateBackground,
    currentBgPosition,
    onUpdateBgPosition,
    currentBezelColor,
    onUpdateBezelColor
}) => {
    const [localSettings, setLocalSettings] = useState<TimerSettings>(settings);
    const [activeTab, setActiveTab] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
    const [appearanceTarget, setAppearanceTarget] = useState<'wallpaper' | 'bezel'>('wallpaper');
    const [bgTab, setBgTab] = useState<'color' | 'image'>('color');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleSave = () => {
        onUpdateSettings(localSettings);
        onClose();
    };

    // Clock Picker Logic
    const getDisplayTime = (key: 'pomodoro' | 'shortBreak' | 'longBreak') => {
        const val = localSettings[key];
        const totalMinutes = Math.round(val * 60);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return { h, m };
    };

    const updateTime = (type: 'h' | 'm', change: number) => {
        const { h, m } = getDisplayTime(activeTab);
        let newH = h;
        let newM = m;

        if (type === 'h') {
            newH = Math.max(0, h + change);
        } else {
            newM = m + change;
            if (newM >= 60) {
                newM = newM - 60;
                newH++;
            } else if (newM < 0) {
                if (newH > 0) {
                    newM = 60 + newM;
                    newH--;
                } else {
                    newM = 0;
                }
            }
        }

        const newVal = newH + (newM / 60);
        setLocalSettings({ ...localSettings, [activeTab]: newVal });
    };

    const { h, m } = getDisplayTime(activeTab);
    const step = activeTab === 'pomodoro' ? 5 : 1;

    // Background Logic
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateBackground(reader.result as string);
                setBgTab('image');
            };
            reader.readAsDataURL(file);
        }
    };

    // Updated presets to complement bezel colors
    const presetColors = [
        '#191919', // Deep Black (Universal)
        '#172554', // Blue 950 (Pairs with Silver/Orange)
        '#064e3b', // Emerald 900 (Pairs with Gold)
        '#450a0a', // Red 950 (Pairs with Gold/Silver)
        '#3f3f46', // Zinc 700 (Pairs with Light Silver)
        '#581c87', // Purple 900 (Pairs with Silver)
        '#e5e7eb', // Gray 200 (Light option for Midnight bezel)
    ];

    const bezelPresets = [
        '#9ca3af', // Silver/Gray (Default)
        '#1f2937', // Midnight
        '#e5e5e5', // Light Silver
        '#d4c4b7', // Gold-ish
        '#f59e0b', // Orange-ish
        '#3b82f6', // Blue
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Container - Compact Width and Padding */}
            <div className="relative bg-[#121214] border border-zinc-800 w-full max-w-[320px] rounded-[1.5rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header - Reduced vertical padding */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/50">
                    <h2 className="text-sm font-bold text-white">Settings</h2>
                    <button onClick={onClose} className="w-6 h-6 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                        <X size={12} />
                    </button>
                </div>

                {/* Content - Compact spacing, removed scroll */}
                <div className="p-5 space-y-5">

                    {/* Appearance Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Appearance</h3>
                            {/* Target Toggle */}
                            <div className="flex gap-0.5 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                                <button
                                    onClick={() => setAppearanceTarget('wallpaper')}
                                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase transition-colors ${appearanceTarget === 'wallpaper' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Wallpaper
                                </button>
                                <button
                                    onClick={() => setAppearanceTarget('bezel')}
                                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase transition-colors ${appearanceTarget === 'bezel' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Bezel
                                </button>
                            </div>
                        </div>

                        {appearanceTarget === 'wallpaper' ? (
                            <>
                                {/* Wallpaper Sub-Tabs (Color/Image) */}
                                <div className="flex justify-start mb-2">
                                    <div className="flex gap-0.5 bg-zinc-900/50 p-0.5 rounded-md">
                                        <button
                                            onClick={() => setBgTab('color')}
                                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${bgTab === 'color' ? 'bg-zinc-700/80 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            Solid
                                        </button>
                                        <button
                                            onClick={() => setBgTab('image')}
                                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${bgTab === 'image' ? 'bg-zinc-700/80 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            Image
                                        </button>
                                    </div>
                                </div>

                                {bgTab === 'color' ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
                                        <div className="flex flex-wrap gap-2">
                                            {/* Transparent / Remove Button */}
                                            <button
                                                onClick={() => onUpdateBackground('transparent')}
                                                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${currentBackground === 'transparent' ? 'border-white scale-110' : 'border-zinc-700 hover:border-zinc-500'}`}
                                                title="Remove Background Color"
                                            >
                                                <Ban size={12} className="text-red-500" />
                                            </button>

                                            {presetColors.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => onUpdateBackground(color)}
                                                    className={`w-7 h-7 rounded-full border-2 transition-all ${currentBackground === color ? 'border-white scale-110' : 'border-transparent hover:border-zinc-500'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>

                                        {/* Custom Color & Hex Input */}
                                        <div className="flex items-center gap-3 bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800">
                                            {/* Color Preview & Native Picker */}
                                            <div className="relative w-8 h-8 rounded-full border-2 border-white/10 shadow-sm overflow-hidden shrink-0 group">
                                                {/* Background for transparent checkboard or color */}
                                                <div
                                                    className="absolute inset-0 w-full h-full"
                                                    style={currentBackground === 'transparent' || (!currentBackground.startsWith('#') && !currentBackground.startsWith('rgb')) ? {
                                                        backgroundImage: `repeating-linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333), repeating-linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333)`,
                                                        backgroundPosition: '0 0, 4px 4px',
                                                        backgroundSize: '8px 8px'
                                                    } : { backgroundColor: currentBackground }}
                                                />

                                                {/* Hidden Native Picker */}
                                                <input
                                                    type="color"
                                                    className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
                                                    value={currentBackground.startsWith('#') ? currentBackground : '#000000'}
                                                    onChange={(e) => onUpdateBackground(e.target.value)}
                                                />
                                            </div>

                                            {/* Hex Code Input */}
                                            <div className="flex-1 flex flex-col">
                                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Hex Code</span>
                                                <input
                                                    type="text"
                                                    value={currentBackground.startsWith('data:') || currentBackground.startsWith('http') || currentBackground.startsWith('url') ? '' : currentBackground}
                                                    onChange={(e) => onUpdateBackground(e.target.value)}
                                                    className="bg-transparent text-xs font-mono font-medium text-white focus:outline-none placeholder-zinc-600 uppercase w-full"
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full py-2 border border-dashed border-zinc-700 rounded-lg flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-900/50 transition-all text-[10px] font-bold uppercase tracking-wider"
                                        >
                                            <Upload size={12} /> Upload Photo
                                        </button>

                                        <div className="space-y-2 p-2 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <Move size={10} />
                                                <span className="text-[9px] font-bold uppercase tracking-widest">Adjust Position</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[9px] text-zinc-500 font-mono"><span>X</span><span>{currentBgPosition.x}%</span></div>
                                                <input
                                                    type="range" min="0" max="100"
                                                    value={currentBgPosition.x}
                                                    onChange={(e) => onUpdateBgPosition({ ...currentBgPosition, x: Number(e.target.value) })}
                                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[9px] text-zinc-500 font-mono"><span>Y</span><span>{currentBgPosition.y}%</span></div>
                                                <input
                                                    type="range" min="0" max="100"
                                                    value={currentBgPosition.y}
                                                    onChange={(e) => onUpdateBgPosition({ ...currentBgPosition, y: Number(e.target.value) })}
                                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Bezel Picker
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex flex-wrap gap-2">
                                    {/* Transparent / Remove Button */}
                                    <button
                                        onClick={() => onUpdateBezelColor('transparent')}
                                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${currentBezelColor === 'transparent' ? 'border-white scale-110' : 'border-zinc-700 hover:border-zinc-500'}`}
                                        title="Remove Bezel Color"
                                    >
                                        <Ban size={12} className="text-red-500" />
                                    </button>

                                    {/* Presets */}
                                    {bezelPresets.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => onUpdateBezelColor(color)}
                                            className={`w-7 h-7 rounded-full border-2 transition-all ${currentBezelColor === color ? 'border-white scale-110' : 'border-transparent hover:border-zinc-500'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>

                                {/* Custom Color & Hex Input */}
                                <div className="flex items-center gap-3 bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800">
                                    {/* Color Preview & Native Picker */}
                                    <div className="relative w-8 h-8 rounded-full border-2 border-white/10 shadow-sm overflow-hidden shrink-0 group">
                                        {/* Background for transparent checkboard or color */}
                                        <div
                                            className="absolute inset-0 w-full h-full"
                                            style={currentBezelColor === 'transparent' ? {
                                                backgroundImage: `repeating-linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333), repeating-linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333)`,
                                                backgroundPosition: '0 0, 4px 4px',
                                                backgroundSize: '8px 8px'
                                            } : { backgroundColor: currentBezelColor }}
                                        />

                                        {/* Hidden Native Picker */}
                                        <input
                                            type="color"
                                            className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
                                            value={currentBezelColor === 'transparent' ? '#000000' : currentBezelColor}
                                            onChange={(e) => onUpdateBezelColor(e.target.value)}
                                        />
                                    </div>

                                    {/* Hex Code Input */}
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Hex Code</span>
                                        <input
                                            type="text"
                                            value={currentBezelColor}
                                            onChange={(e) => onUpdateBezelColor(e.target.value)}
                                            className="bg-transparent text-xs font-mono font-medium text-white focus:outline-none placeholder-zinc-600 uppercase w-full"
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-zinc-800/50 w-full" />

                    {/* Clock Picker Section - Compact */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Duration</h3>
                            <span className="text-[9px] font-medium text-zinc-600 uppercase flex items-center gap-1">
                                <Clock size={10} /> Manual
                            </span>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-0.5 bg-[#09090b] rounded-lg border border-zinc-800/50">
                            {(['pomodoro', 'shortBreak', 'longBreak'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all duration-300 ${activeTab === tab
                                            ? 'bg-zinc-800 text-white shadow-md shadow-black/20'
                                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                                        }`}
                                >
                                    {tab === 'pomodoro' ? 'Focus' : tab === 'shortBreak' ? 'Short' : 'Long'}
                                </button>
                            ))}
                        </div>

                        {/* Digital Clock UI - Reduced heights and font sizes */}
                        <div className="bg-[#09090b] rounded-xl border border-zinc-800 p-3 flex items-center justify-center gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/5 blur-xl group-hover:bg-white/10 transition-all duration-500" />

                            {/* Hours */}
                            <div className="flex flex-col items-center gap-1">
                                <button
                                    onClick={() => updateTime('h', 1)}
                                    className="w-full h-6 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                                >
                                    <ChevronUp size={16} />
                                </button>
                                <div className="w-16 h-12 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center shadow-inner">
                                    <span className="text-3xl font-mono font-bold text-white tracking-wider">
                                        {h.toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => updateTime('h', -1)}
                                    className="w-full h-6 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                                >
                                    <ChevronDown size={16} />
                                </button>
                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Hours</span>
                            </div>

                            <div className="flex flex-col gap-1.5 pb-5">
                                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                            </div>

                            {/* Minutes */}
                            <div className="flex flex-col items-center gap-1">
                                <button
                                    onClick={() => updateTime('m', step)}
                                    className="w-full h-6 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                                >
                                    <ChevronUp size={16} />
                                </button>
                                <div className="w-16 h-12 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center shadow-inner">
                                    <span className="text-3xl font-mono font-bold text-white tracking-wider">
                                        {m.toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => updateTime('m', -step)}
                                    className="w-full h-6 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                                >
                                    <ChevronDown size={16} />
                                </button>
                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Mins</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 pt-0 mt-auto bg-[#121214]">
                    <button
                        onClick={handleSave}
                        className="w-full py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-xl shadow-white/5"
                    >
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SettingsModal;