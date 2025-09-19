import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SessionExtensionModal } from '../components/SessionExtensionModal';
import { useAuthStore } from '../store/auth/useAuthStore';

interface SessionManagerContextType {
  showSessionExtensionPrompt: () => Promise<boolean>;
}

const SessionManagerContext = createContext<SessionManagerContextType | undefined>(undefined);

export const useSessionManager = (): SessionManagerContextType => {
  const context = useContext(SessionManagerContext);
  if (!context) {
    throw new Error('useSessionManager must be used within a SessionManagerProvider');
  }
  return context;
};

interface SessionManagerProviderProps {
  children: ReactNode;
}

export const SessionManagerProvider: React.FC<SessionManagerProviderProps> = ({ children }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [promiseResolve, setPromiseResolve] = useState<((result: boolean) => void) | null>(null);
  const { refreshSession, logout } = useAuthStore();

  const showSessionExtensionPrompt = (): Promise<boolean> => {
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
      setModalVisible(true);
    });
  };

  const handleExtend = async (): Promise<boolean> => {
    console.log('🔄 User chose to extend session');
    const success = await refreshSession();
    return success;
  };

  const handleLogout = () => {
    console.log('🚪 User chose to logout');
    logout();
    if (promiseResolve) {
      promiseResolve(false);
      setPromiseResolve(null);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    if (promiseResolve) {
      promiseResolve(false);
      setPromiseResolve(null);
    }
  };

  const handleExtendComplete = async (): Promise<boolean> => {
    const success = await handleExtend();
    if (promiseResolve) {
      promiseResolve(success);
      setPromiseResolve(null);
    }
    return success;
  };

  return (
    <SessionManagerContext.Provider value={{ showSessionExtensionPrompt }}>
      {children}
      <SessionExtensionModal
        visible={modalVisible}
        onClose={handleClose}
        onExtend={handleExtendComplete}
        onLogout={handleLogout}
      />
    </SessionManagerContext.Provider>
  );
};