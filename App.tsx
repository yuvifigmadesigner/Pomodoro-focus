import React, { useState } from 'react';
import PomodoroTimer from './components/PomodoroTimer';
import SettingsModal from './components/SettingsModal';
import { TimerSettings } from './types';

const App: React.FC = () => {
  // Deep black background for the "Device" look
  const [background, setBackground] = useState<string>('#191919');
  const [bgPosition, setBgPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [bezelColor, setBezelColor] = useState<string>('#9ca3af'); // Default Gray-400
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Default Settings in Hours
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    pomodoro: 0.5, // 30 minutes
    shortBreak: 0.1, // 6 minutes
    longBreak: 0.25, // 15 minutes
    autoStartBreaks: false,
    autoStartPomodoros: false,
  });

  const backgroundStyle: React.CSSProperties = {
     background: background.startsWith('#') || background.startsWith('rgb') ? background : `url("${background}")`,
     backgroundColor: background.startsWith('#') || background.startsWith('rgb') ? background : '#191919',
     backgroundSize: 'cover',
     backgroundPosition: `${bgPosition.x}% ${bgPosition.y}%`,
     backgroundRepeat: 'no-repeat',
     transition: 'background-image 0.5s ease-in-out' // Smooth transition for images
  };

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans"
      style={backgroundStyle}
    >
      {/* Main Content Area - Centered Widget */}
      <main className="z-10 w-full flex flex-col items-center justify-center p-4">
        <PomodoroTimer 
          settings={timerSettings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          bezelColor={bezelColor}
        />
      </main>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={timerSettings}
        onUpdateSettings={setTimerSettings}
        currentBackground={background}
        onUpdateBackground={setBackground}
        currentBgPosition={bgPosition}
        onUpdateBgPosition={setBgPosition}
        currentBezelColor={bezelColor}
        onUpdateBezelColor={setBezelColor}
      />
    </div>
  );
};

export default App;