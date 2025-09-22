import { create } from "zustand";

export interface ErrorState {
    message: string;
    isVisible: boolean;
    type: 'error' | 'warning' | 'success';
    showError: (message: string, type?: 'error' | 'warning' | 'success') => void;
    hideError: () => void;
}

export const useErrorStore = create<ErrorState>()((set) => ({
    message: '',
    isVisible: false,
    type: 'error',

    showError: (message: string, type: 'error' | 'warning' | 'success' = 'error') => {
        set({ message, isVisible: true, type });
        
        // Auto hide after 4 seconds
        setTimeout(() => {
            set({ isVisible: false });
        }, 4000);
    },

    hideError: () => {
        set({ isVisible: false });
    }
}));