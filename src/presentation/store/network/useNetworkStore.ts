import { create } from "zustand";

export interface NetworkState {
    hasConnection: boolean;
    showAlert: boolean;
    alertMessage: string;
    setConnectionStatus: (hasConnection: boolean, message?: string) => void;
    hideAlert: () => void;
}

export const useNetworkStore = create<NetworkState>()((set) => ({
    hasConnection: true,
    showAlert: false,
    alertMessage: '',

    setConnectionStatus: (hasConnection: boolean, message: string = 'Sin conexión a internet') => {
        set({ 
            hasConnection, 
            showAlert: !hasConnection, 
            alertMessage: message 
        });

        // Auto hide alert after 5 seconds if connection is restored
        if (hasConnection) {
            setTimeout(() => {
                set({ showAlert: false });
            }, 2000);
        }
    },

    hideAlert: () => {
        set({ showAlert: false });
    }
}));