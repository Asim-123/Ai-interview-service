import { create } from 'zustand';

export interface QuestionItem {
  id: string;
  question: string;
  answer: string;
  source: 'mic' | 'chat' | 'caption' | 'manual';
  platform?: 'meet' | 'zoom' | 'teams' | 'other';
  confidence: number;
  timestamp: Date;
  answerStyle: 'concise' | 'star' | 'technical';
  isStreaming?: boolean;
  isAnswered?: boolean;
}

interface CopilotState {
  sessionId: string | null;
  jobRole: string;
  platform: 'meet' | 'zoom' | 'teams' | 'other';
  isListening: boolean;
  isMeetingActive: boolean;
  questions: QuestionItem[];
  currentQuestion: QuestionItem | null;
  answerStyle: 'concise' | 'star' | 'technical';
  useResume: boolean;
  extensionConnected: boolean;
  systemAudioEnabled: boolean;
  sessionStartTime: Date | null;
  
  setSessionId: (id: string | null) => void;
  setJobRole: (role: string) => void;
  setPlatform: (platform: 'meet' | 'zoom' | 'teams' | 'other') => void;
  setListening: (listening: boolean) => void;
  setMeetingActive: (active: boolean) => void;
  addQuestion: (question: QuestionItem) => void;
  updateQuestion: (id: string, updates: Partial<QuestionItem>) => void;
  setCurrentQuestion: (question: QuestionItem | null) => void;
  setAnswerStyle: (style: 'concise' | 'star' | 'technical') => void;
  setUseResume: (use: boolean) => void;
  setExtensionConnected: (connected: boolean) => void;
  setSystemAudioEnabled: (enabled: boolean) => void;
  startSession: () => void;
  endSession: () => void;
  clearQuestions: () => void;
}

export const useCopilotStore = create<CopilotState>((set) => ({
  sessionId: null,
  jobRole: '',
  platform: 'other',
  isListening: false,
  isMeetingActive: false,
  questions: [],
  currentQuestion: null,
  answerStyle: 'concise',
  useResume: true,
  extensionConnected: false,
  systemAudioEnabled: false,
  sessionStartTime: null,

  setSessionId: (id) => set({ sessionId: id }),
  setJobRole: (role) => set({ jobRole: role }),
  setPlatform: (platform) => set({ platform }),
  setListening: (listening) => set({ isListening: listening }),
  setMeetingActive: (active) => set({ isMeetingActive: active }),
  
  addQuestion: (question) =>
    set((state) => ({
      questions: [question, ...state.questions],
      currentQuestion: question,
    })),
  
  updateQuestion: (id, updates) =>
    set((state) => ({
      questions: state.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
      currentQuestion: state.currentQuestion?.id === id 
        ? { ...state.currentQuestion, ...updates } 
        : state.currentQuestion,
    })),
  
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setAnswerStyle: (style) => set({ answerStyle: style }),
  setUseResume: (use) => set({ useResume: use }),
  setExtensionConnected: (connected) => set({ extensionConnected: connected }),
  setSystemAudioEnabled: (enabled) => set({ systemAudioEnabled: enabled }),
  
  startSession: () => set({ sessionStartTime: new Date(), isMeetingActive: true }),
  
  endSession: () => set({ 
    isMeetingActive: false, 
    isListening: false,
    sessionStartTime: null,
  }),
  
  clearQuestions: () => set({ questions: [], currentQuestion: null }),
}));
