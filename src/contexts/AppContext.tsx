import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AppState {
  sessionCode: string | null;
  sessionName: string | null;
  participantName: string | null;
  missionId: string | null;
}

interface AppContextType extends AppState {
  setSession: (code: string, name: string, missionId: string) => void;
  setParticipantName: (name: string) => void;
  setMissionId: (missionId: string) => void;
  reset: () => void;
}

const STORAGE_KEY = "mailmate_session";

const defaultState: AppState = {
  sessionCode: null,
  sessionName: null,
  participantName: null,
  missionId: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setSession = (code: string, name: string, missionId: string) => {
    setState((prev) => ({ ...prev, sessionCode: code, sessionName: name, missionId }));
  };

  const setParticipantName = (name: string) => {
    setState((prev) => ({ ...prev, participantName: name }));
  };

  const setMissionId = (missionId: string) => {
    setState((prev) => ({ ...prev, missionId }));
  };

  const reset = () => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AppContext.Provider value={{ ...state, setSession, setParticipantName, setMissionId, reset }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppContextProvider");
  }
  return context;
};
