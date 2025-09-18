import { ditoApi } from "../../config/ditoApi";
import { User } from "../../domain/entities/user";
import { LoginResponse } from "../../infrastructure/interfaces/auth.responses";


const returnUserToken = (data: LoginResponse) => {

    const user: User = {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        isActive: data.isActive,
        roles: data.roles,
        allowMultipleSessions: data.allowMultipleSessions,
        foundDeviceToken: data.foundDeviceToken ?? null,
    }

    return {
        user,
        token: data.token,
        refreshToken: data.refreshToken
    };
}


export const authLogin = async (email: string, password: string, deviceToken: string): Promise<{ user: User, token: string, refreshToken: string } | null> => {
    email = email.toLowerCase().trim();
    try {
        const { data } = await ditoApi.post<LoginResponse>('/auth/login', { email, password, deviceToken });
        const result = returnUserToken(data);

        return result;
    } catch (error: any) {
        if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
            console.log('Login auth error (silent)');
            return null;
        }

        let message = 'Ocurrió un error al iniciar sesión.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Login error:', message, error);
        throw new Error(message);
    }
};


export const authValidateToken = async (): Promise<{ user: User, token: string, refreshToken: string } | null> => {
    try {
        const { data } = await ditoApi.get<LoginResponse>('/auth/check-status?deviceToken=86e7023e-37ad-487e-ade0-17f2941f5464');
        return returnUserToken(data);
    } catch (error: any) {
        // Si es error de autenticación (400, 401, 403), no mostrar error
        if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
            console.log('Token validation: No valid token found (silent)');
            return null;
        }

        // Para otros errores sí mostrar el log
        let message = 'Error validando el token.';
        if (error.response && error.response.data && error.response.data.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Token validation error:', message, error);
        return null;
    }
};

export const authLoginWithDeviceToken = async (deviceToken: string): Promise<{ user: User, token: string, refreshToken: string } | null> => {
    try {
        const { data } = await ditoApi.post<LoginResponse>('/auth/login-with-device-token', { deviceToken });
        return returnUserToken(data);
    } catch (error: any) {
        let message = 'Error en login biométrico.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Biometric login error:', message, error);
        return null;
    }
};
