import { create } from "zustand";
import { User } from "../../../domain/entities/user";
import { AuthStatus } from "../../../infrastructure/interfaces/auth.status";
import { StorageAdapter } from "../../../config/adapters/async-storage";
import { authLogin, authLoginWithDeviceToken, authValidateToken } from "../../../actions/auth/auth";


export interface AuthState {
    status: AuthStatus;
    token?: string;
    refreshToken?: string;
    user?: User;
    isBiometricEnabledInBackend?: boolean;

    login: (email: string, password: string) => Promise<boolean>;
    loginWithBiometrics: () => Promise<boolean>;
    logout: () => void;
    checkStatus: () => Promise<boolean>;

}


export const useAuthStore = create<AuthState>()((set, get) => ({

    status: 'checking',
    token: undefined,
    refreshToken: undefined,
    user: undefined,
    isBiometricEnabledInBackend: false,

    login: async (email: string, password: string) => {

        const resp = await authLogin(email, password, '86e7023e-37ad-487e-ade0-17f2941f5464');

        if (!resp) {
            set({ status: 'unauthenticated', token: undefined, user: undefined, refreshToken: undefined });

            return false;
        }


        await StorageAdapter.setItem('token', resp.token);
        await StorageAdapter.setItem('refreshToken', resp.refreshToken);

        if (resp.user.foundDeviceToken) { // Si contiene algo
            await StorageAdapter.setItem('biometricEnabled', resp.user.foundDeviceToken.biometricEnabled.toString());
        }

        // Determinar si la biometría está habilitada en el backend
        const isBiometricEnabled = resp.user.foundDeviceToken?.biometricEnabled || false;

        set({
            status: 'authenticated',
            token: resp.token,
            user: resp.user,
            isBiometricEnabledInBackend: isBiometricEnabled
        });

        return true;

    },

    loginWithBiometrics: async () => {
        try {
            const resp = await authLoginWithDeviceToken("86e7023e-37ad-487e-ade0-17f2941f5464");
            if (!resp) return false;

            await StorageAdapter.setItem('token', resp.token);

            // Solo guardar refreshToken si existe en la respuesta
            if (resp.refreshToken) {
                await StorageAdapter.setItem('refreshToken', resp.refreshToken);
            }

            // Determinar si la biometría está habilitada en el backend
            const isBiometricEnabled = resp.user.foundDeviceToken?.biometricEnabled || false;

            set({
                status: 'authenticated',
                token: resp.token,
                user: resp.user,
                isBiometricEnabledInBackend: isBiometricEnabled
            });
            return true;

        } catch (e) {
            console.log("Biometric login failed:", e);
            return false;
        }
    },

    logout: async () => {
        try {
            await StorageAdapter.removeItem('token');
            await StorageAdapter.removeItem('refreshToken');

            console.log("Deleting token, refreshToken, and foundDeviceToken on logout");

            set({
                status: 'unauthenticated',
                token: undefined,
                refreshToken: undefined,
                user: undefined,
                // isBiometricEnabledInBackend: false
            });
        } catch (error) {
            console.error('Error during logout:', error);
            // Asegurar que el estado se limpie incluso si hay error
            set({
                status: 'unauthenticated',
                token: undefined,
                refreshToken: undefined,
                user: undefined,
                isBiometricEnabledInBackend: false
            });
        }
    },

    checkStatus: async () => {
        // Primero verificar si hay token en storage
        const storedToken = await StorageAdapter.getItem('token');
        const storedBiometricEnabled = await StorageAdapter.getItem('biometricEnabled');

        if (!storedToken) {
            console.log('No token found in storage');
            set({
                status: 'unauthenticated',
                token: undefined,
                refreshToken: undefined,
                user: undefined,
                isBiometricEnabledInBackend: storedBiometricEnabled 
            });
            return false;
        }

        const resp = await authValidateToken();

        console.log('Check status response:', resp);
        if (!resp) {
            set({
                status: 'unauthenticated',
                token: undefined,
                refreshToken: undefined,
                user: undefined,
                isBiometricEnabledInBackend: storedBiometricEnabled
            });
            return false;
        }

        await StorageAdapter.setItem('token', resp.token);

        // Solo guardar refreshToken si existe en la respuesta
        if (resp.refreshToken) {
            await StorageAdapter.setItem('refreshToken', resp.refreshToken);
        }

        // Determinar si la biometría está habilitada en el backend
        const isBiometricEnabled = resp.user.foundDeviceToken?.biometricEnabled || false;

        set({
            status: 'authenticated',
            token: resp.token,
            user: resp.user,
            isBiometricEnabledInBackend: isBiometricEnabled
        });

        return true;
    },

}))
