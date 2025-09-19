import { create } from "zustand";
import { User } from "../../../domain/entities/user";
import { AuthStatus } from "../../../infrastructure/interfaces/auth.status";
import { StorageAdapter } from "../../../config/adapters/async-storage";
import { authLogin, authLoginWithDeviceToken, authValidateToken, setMainDevice, authRefreshToken } from "../../../actions/auth/auth";
import { generateDeviceToken, saveDeviceToken, toggleBiometrics } from "../../../actions/security/security";


export interface AuthState {
    status: AuthStatus;
    token?: string;
    refreshToken?: string;
    user?: User;
    isBiometricEnabledInBackend?: boolean; // Se dara uso tambien en LoginScreen
    deviceToken?: string;
    deviceIsActive?: boolean;
    isRefreshing?: boolean; // Estado para indicar si se está renovando el token

    login: (email: string, password: string) => Promise<boolean>;
    loginWithBiometrics: () => Promise<boolean>;
    logout: () => void;
    checkStatus: () => Promise<boolean>;
    refreshSession: () => Promise<boolean>; // Nueva función para renovar sesión manualmente

    // Config
    toggleBiometrics: (enabled: boolean) => Promise<boolean>;

    //Extras
    removeStorageItem: (key: string) => Promise<void>;
}


export const useAuthStore = create<AuthState>()((set, get) => ({

    status: 'checking',
    token: undefined,
    refreshToken: undefined,
    user: undefined,
    isBiometricEnabledInBackend: false,
    deviceToken: undefined,
    deviceIsActive: undefined,
    isRefreshing: false,

    login: async (email: string, password: string) => {


        let deviceToken = await StorageAdapter.getItem('deviceToken');


        const resp = await authLogin(email, password, deviceToken || "");


        if (!resp) {
            set({ status: 'unauthenticated', token: undefined, user: undefined, refreshToken: undefined });
            return false;
        }

        await StorageAdapter.setItem('token', resp.token);
        await StorageAdapter.setItem('refreshToken', resp.refreshToken);


        if (resp?.user.foundDeviceToken) {
            console.log("Using device token from storage:", resp?.user.foundDeviceToken);
        } else {
            const response = await generateDeviceToken();
            if (!response || !response.deviceToken) {
                console.error("Failed to generate device token");
                return false;
            }
            deviceToken = response.deviceToken.trim();
            if (!deviceToken) {
                console.error("Failed to generate device token");
                return false;
            }
            await StorageAdapter.setItem('deviceToken', deviceToken);
            await saveDeviceToken(deviceToken);
        }

        // Guardar el device token del dispositivo
        if (resp.user.foundDeviceToken) {
            await StorageAdapter.setItem('deviceToken', resp.user.foundDeviceToken.deviceToken);
        }

        if (resp.user.foundDeviceToken) { // Si contiene algo
            console.log("biometricEnabled", resp.user.foundDeviceToken.biometricEnabled);
            await StorageAdapter.setItem('biometricEnabled', resp.user.foundDeviceToken.biometricEnabled.toString());
        }

        // Determinar si la biometría está habilitada en el backend
        const isBiometricEnabled = resp.user.foundDeviceToken?.biometricEnabled || false;


        console.log("Device is active status:", resp.user.foundDeviceToken?.isActive);
        if (!resp.user.foundDeviceToken.isActive) {
            console.log("Device token is not active");
            /*  
 
             set({
                 status: 'unauthenticated',
                 token: undefined,
                 user: undefined,
                 isBiometricEnabledInBackend: isBiometricEnabled,
                 deviceToken: resp.user.foundDeviceToken?.deviceToken,
                 deviceIsActive: resp.user.foundDeviceToken?.isActive
             });
 
             return false; */
        } else {
            console.log("Device token is active");
        }
        set({
            status: 'authenticated',
            token: resp.token,
            user: resp.user,
            isBiometricEnabledInBackend: isBiometricEnabled,
            deviceToken: resp.user.foundDeviceToken?.deviceToken
        });

        return true;

    },

    loginWithBiometrics: async () => {
        try {

            let deviceToken = await StorageAdapter.getItem('deviceToken');

            const resp = await authLoginWithDeviceToken(deviceToken || "");
            if (!resp) return false;

            await StorageAdapter.setItem('token', resp.token);

            // Solo guardar refreshToken si existe en la respuesta
            if (resp.refreshToken) {
                await StorageAdapter.setItem('refreshToken', resp.refreshToken);
            }

            if (resp.user.foundDeviceToken) {
                await StorageAdapter.setItem('deviceToken', resp.user.foundDeviceToken.deviceToken);
            }

            // Determinar si la biometría está habilitada en el backend
            const isBiometricEnabled = resp.user.foundDeviceToken?.biometricEnabled || false;

            console.log("Device is active status:", resp.user.foundDeviceToken?.isActive);
            if (!resp.user.foundDeviceToken.isActive) {
                console.log("Device token is not active");

                /*   set({
                      status: 'unauthenticated',
                      token: undefined,
                      user: undefined,
                      isBiometricEnabledInBackend: isBiometricEnabled,
                      deviceToken: resp.user.foundDeviceToken?.deviceToken,
                      deviceIsActive: resp.user.foundDeviceToken?.isActive
                  });
  
                  return false; */

                console.log("Device token is not active, trying to set as main device");
                setMainDevice(resp.user.foundDeviceToken.deviceToken);
            } else {
                console.log("Device token is active");
            }

            set({
                status: 'authenticated',
                token: resp.token,
                user: resp.user,
                isBiometricEnabledInBackend: isBiometricEnabled,
                deviceToken: resp.user.foundDeviceToken?.deviceToken
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
        const storedDeviceToken = await StorageAdapter.getItem('deviceToken');

        if (!storedToken) {
            console.log('No token found in storage');
            set({
                status: 'unauthenticated',
                token: undefined,
                refreshToken: undefined,
                user: undefined,
                isBiometricEnabledInBackend: storedBiometricEnabled === 'true',
                deviceToken: storedDeviceToken || undefined
            });
            return false;
        }

        let deviceToken = await StorageAdapter.getItem('deviceToken');

        if (!deviceToken) {
            console.log('No device token found');
            set({
                status: 'unauthenticated',
                token: undefined,
                refreshToken: undefined,
                user: undefined,
                isBiometricEnabledInBackend: storedBiometricEnabled === 'true',
                deviceToken: undefined
            });
            return false;
        }

        const resp = await authValidateToken(deviceToken);

        console.log('Check status response:', resp);
        if (!resp) {
            set({
                status: 'unauthenticated',
                token: undefined,
                refreshToken: undefined,
                user: undefined,
                isBiometricEnabledInBackend: storedBiometricEnabled === 'true',
                deviceToken: storedDeviceToken || undefined
            });
            return false;
        }

        await StorageAdapter.setItem('token', resp.token);

        // Solo guardar refreshToken si existe en la respuesta
        if (resp.refreshToken) {
            await StorageAdapter.setItem('refreshToken', resp.refreshToken);
        }

        if (resp.user.foundDeviceToken) {
            await StorageAdapter.setItem('deviceToken', resp.user.foundDeviceToken.deviceToken);
        }

        // Determinar si la biometría está habilitada en el backend
        const isBiometricEnabled = resp.user.foundDeviceToken?.biometricEnabled || false;

        set({
            status: 'authenticated',
            token: resp.token,
            user: resp.user,
            isBiometricEnabledInBackend: isBiometricEnabled,
            deviceToken: resp.user.foundDeviceToken?.deviceToken
        });

        return true;
    },

    toggleBiometrics: async (enabled: boolean) => {
        const deviceToken = await StorageAdapter.getItem('deviceToken');
        if (!deviceToken) {
            console.error("No device token available to toggle biometrics");
            return false;
        }
        const result = await toggleBiometrics(enabled, deviceToken);

        if (result) {
            await StorageAdapter.setItem('biometricEnabled', enabled.toString());
            set({ isBiometricEnabledInBackend: enabled });
        }

        return result;
    },

    refreshSession: async () => {
        const currentState = get();
        
        // Evitar múltiples refreshes simultáneos
        if (currentState.isRefreshing) {
            console.log('🔄 Ya hay un refresh en progreso, esperando...');
            return false;
        }

        set({ isRefreshing: true });

        try {
            const storedRefreshToken = await StorageAdapter.getItem('refreshToken');
            const storedDeviceToken = await StorageAdapter.getItem('deviceToken');

            if (!storedRefreshToken || !storedDeviceToken) {
                console.error('❌ No refresh token or device token available');
                set({ isRefreshing: false });
                return false;
            }

            const resp = await authRefreshToken(storedDeviceToken, storedRefreshToken);

            if (!resp) {
                console.error('❌ Failed to refresh session');
                set({ isRefreshing: false });
                return false;
            }

            // Actualizar tokens en storage
            await StorageAdapter.setItem('token', resp.token);
            await StorageAdapter.setItem('refreshToken', resp.refreshToken);

            if (resp.user.foundDeviceToken) {
                await StorageAdapter.setItem('deviceToken', resp.user.foundDeviceToken.deviceToken);
            }

            // Determinar si la biometría está habilitada en el backend
            const isBiometricEnabled = resp.user.foundDeviceToken?.biometricEnabled || false;

            // Actualizar estado
            set({
                status: 'authenticated',
                token: resp.token,
                refreshToken: resp.refreshToken,
                user: resp.user,
                isBiometricEnabledInBackend: isBiometricEnabled,
                deviceToken: resp.user.foundDeviceToken?.deviceToken,
                isRefreshing: false
            });

            console.log('✅ Session refreshed successfully');
            return true;

        } catch (error) {
            console.error('❌ Error refreshing session:', error);
            set({ isRefreshing: false });
            return false;
        }
    },

    removeStorageItem: async (key: string) => {
        try {
            await StorageAdapter.removeItem(key);
        } catch (error) {
            console.error(`Error removing item ${key} from storage:`, error);
        }
    },


}))
