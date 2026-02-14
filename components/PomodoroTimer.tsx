import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, TimerState, TimerSettings } from '../types';
import { Play, Pause, RotateCcw, Grid, Moon, Sun, Clock, ChevronDown } from 'lucide-react';

// Custom Coffee Icon for granular animation control
const CoffeeIcon = ({ isRunning, size = 14, className = "" }: { isRunning: boolean, size?: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    {/* Steam lines with staggered pulse animation */}
    <line x1="6" x2="6" y1="2" y2="4" className={isRunning ? "animate-pulse" : ""} style={{ animationDelay: '0ms' }} />
    <line x1="10" x2="10" y1="2" y2="4" className={isRunning ? "animate-pulse" : ""} style={{ animationDelay: '300ms' }} />
    <line x1="14" x2="14" y1="2" y2="4" className={isRunning ? "animate-pulse" : ""} style={{ animationDelay: '600ms' }} />
  </svg>
);

const DEFAULT_SOUNDS = [
  { id: 'digital', name: 'Digital', url: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg' },
  { id: 'mechanical', name: 'Clock', url: 'https://actions.google.com/sounds/v1/alarms/mechanical_clock_ring.ogg' },
  { id: 'bugle', name: 'Bugle', url: 'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg' },
];

interface PomodoroTimerProps {
  settings: TimerSettings;
  onOpenSettings: () => void;
  bezelColor: string;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ settings, onOpenSettings, bezelColor }) => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.POMODORO);
  const [state, setState] = useState<TimerState>(TimerState.STOPPED);
  // Settings are now in hours. Convert to seconds: hours * 60 * 60 = hours * 3600
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro * 3600);

  // Alarm State
  const [sounds, setSounds] = useState(DEFAULT_SOUNDS);
  const [selectedSound, setSelectedSound] = useState(DEFAULT_SOUNDS[0].url);
  const [alarmDuration, setAlarmDuration] = useState(5); // Default 5s
  const soundInputRef = useRef<HTMLInputElement>(null);

  const isInitialMount = useRef(true);

  // Preview sound effect
  useEffect(() => {
    // Skip preview on initial render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const audio = new Audio(selectedSound);
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Audio preview play failed:", error);
      });
    }

    // Stop preview after 3 seconds
    const timer = setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 3000);

    return () => {
      clearTimeout(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [selectedSound]);

  // Update timer when settings or mode change
  useEffect(() => {
    if (state === TimerState.STOPPED) {
      let duration = settings.pomodoro;
      if (mode === TimerMode.SHORT_BREAK) duration = settings.shortBreak;
      if (mode === TimerMode.LONG_BREAK) duration = settings.longBreak;
      setTimeLeft(duration * 3600);
    }
  }, [settings, mode, state]);

  // Handle Timer Tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (state === TimerState.RUNNING && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);

            // Play sound logic
            const audio = new Audio(selectedSound);
            audio.loop = true;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch(e => console.log('Audio blocked', e));
            }

            // Stop sound after duration
            setTimeout(() => {
              audio.pause();
              audio.currentTime = 0;
            }, alarmDuration * 1000);

            // Auto-switch logic
            if (mode === TimerMode.POMODORO) {
              setMode(TimerMode.SHORT_BREAK);
              const nextTime = settings.shortBreak * 3600;
              if (settings.autoStartBreaks) {
                // We need to return 0 to finish this tick, but state update will happen in effect
                setTimeout(() => {
                  setTimeLeft(nextTime);
                  setState(TimerState.RUNNING);
                }, 0);
              } else {
                setTimeout(() => {
                  setTimeLeft(nextTime);
                  setState(TimerState.STOPPED);
                }, 0);
              }
            } else {
              setMode(TimerMode.POMODORO);
              const nextTime = settings.pomodoro * 3600;
              if (settings.autoStartPomodoros) {
                setTimeout(() => {
                  setTimeLeft(nextTime);
                  setState(TimerState.RUNNING);
                }, 0);
              } else {
                setTimeout(() => {
                  setTimeLeft(nextTime);
                  setState(TimerState.STOPPED);
                }, 0);
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state, timeLeft, mode, settings, selectedSound, alarmDuration]);

  const toggleTimer = () => {
    setState(prev => prev === TimerState.RUNNING ? TimerState.PAUSED : TimerState.RUNNING);
  };

  const resetTimer = () => {
    setState(TimerState.STOPPED);
    let duration = settings.pomodoro;
    if (mode === TimerMode.SHORT_BREAK) duration = settings.shortBreak;
    if (mode === TimerMode.LONG_BREAK) duration = settings.longBreak;
    setTimeLeft(duration * 3600);
  };

  const cycleMode = () => {
    setState(TimerState.STOPPED);
    if (mode === TimerMode.POMODORO) setMode(TimerMode.SHORT_BREAK);
    else if (mode === TimerMode.SHORT_BREAK) setMode(TimerMode.LONG_BREAK);
    else setMode(TimerMode.POMODORO);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSoundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const soundUrl = reader.result as string;
        // Create a short name
        let name = file.name.split('.')[0];
        if (name.length > 10) name = name.substring(0, 8) + '..';

        const newSound = {
          id: `custom-${Date.now()}`,
          name: name,
          url: soundUrl
        };
        setSounds(prev => [...prev, newSound]);
        setSelectedSound(soundUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper for toggle visuals
  const isRunning = state === TimerState.RUNNING;

  // UI Helpers
  const getModeLabel = () => {
    if (mode === TimerMode.POMODORO) return 'Focus';
    if (mode === TimerMode.SHORT_BREAK) return 'Short';
    return 'Long';
  };

  const getModeIcon = () => {
    if (mode === TimerMode.POMODORO) {
      return <Sun size={14} className={`mr-1 transition-transform duration-1000 ${isRunning ? 'animate-[spin_4s_linear_infinite]' : ''}`} />;
    }
    if (mode === TimerMode.LONG_BREAK) {
      // Use custom icon for the steam animation
      return <CoffeeIcon isRunning={isRunning} size={14} className="mr-1" />;
    }
    return <Moon size={14} className={`mr-1 ${isRunning ? 'animate-pulse' : ''}`} />;
  };

  return (
    <div className="relative">
      {/* Device Body */}
      <div
        className="w-[320px] rounded-[3rem] p-5 shadow-2xl ring-1 ring-white/10 relative transition-colors duration-500"
        style={{ backgroundColor: bezelColor }}
      >

        {/* Screen Area */}
        <div className="bg-black rounded-[2.2rem] p-6 h-[240px] relative flex flex-col items-center justify-center shadow-inner shadow-gray-900">

          {/* Top Center: Mode Switcher */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={cycleMode}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all duration-300 active:scale-95 ${isRunning
                ? 'bg-orange-500/10 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)] ring-1 ring-orange-500/50'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 ring-1 ring-white/5'
                }`}
            >
              {getModeIcon()}
              {getModeLabel()}
            </button>
          </div>

          {/* Main Timer Display */}
          <div className="z-0 mt-2">
            <span className="text-[5.5rem] leading-none font-bold text-white font-sans tracking-tighter tabular-nums drop-shadow-2xl">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Bottom Left: Alarm Settings */}
          <div className="absolute bottom-5 left-6 flex items-center gap-2">
            {/* Sound Dropdown */}
            <div className="relative group">
              <select
                value={selectedSound}
                onChange={(e) => {
                  if (e.target.value === 'upload-custom') {
                    soundInputRef.current?.click();
                  } else {
                    setSelectedSound(e.target.value);
                  }
                }}
                className="bg-zinc-900/80 text-zinc-300 hover:text-white pl-2 pr-6 py-1.5 rounded-lg text-[11px] font-bold appearance-none cursor-pointer transition-colors outline-none w-[90px] truncate text-left border border-white/10 hover:border-white/20"
              >
                {sounds.map(s => (
                  <option key={s.id} value={s.url} className="text-black">{s.name}</option>
                ))}
                <option value="upload-custom" className="font-bold text-gray-600 bg-gray-200">+ Upload</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-white transition-colors" />
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={soundInputRef}
              className="hidden"
              accept="audio/*"
              onChange={handleSoundUpload}
            />
          </div>

          {/* Bottom Right: Reset Icon */}
          <button
            onClick={resetTimer}
            className="absolute right-6 bottom-5 w-8 h-8 bg-zinc-900/80 rounded-lg border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all active:scale-90"
            title="Reset Timer"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Bottom Controls Area */}
        <div className="flex items-center justify-between mt-6 px-2 pb-2">

          {/* Settings Button (Grid Icon) */}
          <button
            onClick={onOpenSettings}
            className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center shadow-lg shadow-black/20 hover:bg-gray-700 active:scale-95 transition-all group"
          >
            <Grid size={24} className="text-gray-400 group-hover:text-white transition-colors" />
          </button>

          {/* Play/Pause Toggle Switch */}
          <button
            onClick={toggleTimer}
            className="w-32 h-16 bg-gray-900 rounded-full relative shadow-lg shadow-black/20 active:scale-95 transition-transform overflow-hidden"
          >
            {/* The Switch Track */}
            <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />

            {/* The "Knob" */}
            {/* 
                    Logic:
                    - Stopped/Paused (Default): Position Left (Gray)
                    - Running (Active): Position Right (Orange)
                    Using rem units for consistent scaling:
                    - Container: w-32 (8rem)
                    - Padding: top-1.5/left-1.5 (0.375rem)
                    - Knob: w-[3.25rem] (52px equivalent at 16px base)
                    - Translation: translate-x-16 (4rem)
                    - 0.375 + 3.25 + 4 + 0.375 = 8.000 (Exact fit)
                */}
            <div
              className={`absolute top-1.5 left-1.5 w-[3.25rem] h-[3.25rem] rounded-full flex items-center justify-center transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                        ${isRunning
                  ? 'translate-x-16 bg-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' // Running -> Right (Active)
                  : 'translate-x-0 bg-gray-700 text-white shadow-none' // Stopped -> Left (Default)
                }
                    `}
            >
              {isRunning ? (
                <Pause size={24} className="fill-current" />
              ) : (
                <Play size={24} className="fill-current ml-1" />
              )}
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;