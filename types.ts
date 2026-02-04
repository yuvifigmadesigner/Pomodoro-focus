export enum TimerMode {
  POMODORO = 'POMODORO',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export enum TimerState {
  STOPPED = 'STOPPED',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
}

export interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface AIRecommendation {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  reasoning: string;
  themeDescription: string;
}

export interface BackgroundState {
  type: 'color' | 'image' | 'gradient';
  value: string; // Hex code, Image URL/Base64, or Gradient string
}
