import { create } from "zustand";
import { User } from "../../../domain/entities/user";
import { AuthStatus } from "../../../infrastructure/interfaces/auth.status";
import { StorageAdapter } from "../../../config/adapters/async-storage";
import { authLogin, authLoginWithDeviceToken, authValidateToken } from "../../../actions/auth/auth";


export interface AuthState {
    status: AuthStatus;
    token?: string;
    refreshToken?: string;
    user?: User


    login: (email: string, password: string) => Promise<boolean>;
    loginWithBiometrics: () => Promise<boolean>;
    logout: () => void;
    checkStatus: () => Promise<boolean>;


}


export const useAuthStore = create<AuthState>()((set, get) => ({

    status: 'checking',
    token: undefined,
    user: undefined,

    login: async (email: string, password: string) => {

        const resp = await authLogin(email, password, '86e7023e-37ad-487e-ade0-17f2941f5464');

        console.log(resp)
        if (!resp) {
            set({ status: 'unauthenticated', token: undefined, user: undefined });

            return false;
        }


        await StorageAdapter.setItem('token', resp.token);
        await StorageAdapter.setItem('refreshToken', resp.refreshToken);


        set({ status: 'authenticated', token: resp.token, user: resp.user });

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

            set({ status: 'authenticated', token: resp.token, user: resp.user });
            return true;

        } catch (e) {
            console.log("Biometric login failed:", e);
            return false;
        }
    },

    logout: async () => {
        await StorageAdapter.removeItem('token');
        await StorageAdapter.removeItem('refreshToken');

        set({ status: 'unauthenticated', token: undefined, user: undefined });
    },

    checkStatus: async () => {

        const resp = await authValidateToken();

        console.log(resp)
        if (!resp) {
            set({ status: 'unauthenticated', token: undefined, user: undefined });
            return false;
        }

        await StorageAdapter.setItem('token', resp.token);
        
        // Solo guardar refreshToken si existe en la respuesta
        if (resp.refreshToken) {
            await StorageAdapter.setItem('refreshToken', resp.refreshToken);
        }

        set({ status: 'authenticated', token: resp.token, user: resp.user });


        return true;

    },

}))
