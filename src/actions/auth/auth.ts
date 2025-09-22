import { ditoApi } from "../../config/ditoApi";
import { User } from "../../domain/entities/user";
import { LoginResponse, RegisterResponse, JobStatusResponse } from "../../infrastructure/interfaces/auth.responses";
import { useErrorStore } from "../../presentation/store/error/useErrorStore";
import { extractErrorMessage, shouldShowError, getErrorType } from "../../utils/errorUtils";


const returnUserToken = (data: LoginResponse) => {

    const user: User = {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        isActive: data.isActive ?? true,
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


export const authLogin = async (email: string, password: string, deviceToken?: string): Promise<{ user: User, token: string, refreshToken: string } | null> => {
    email = email.toLowerCase().trim();
    try {
        const { data } = await ditoApi.post<LoginResponse>('/auth/login', { email, password, deviceToken });
        const result = returnUserToken(data);

        return result;
    } catch (error: any) {
        // Extraer mensaje de error
        const errorMessage = extractErrorMessage(error);
        const errorStore = useErrorStore.getState();
        
        // Manejar errores específicos que queremos mostrar al usuario
        if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
            // Mostrar mensaje específico para estos errores
            errorStore.showError(errorMessage, 'warning');
            console.log('Login auth error (showing to user)');
            return null;
        }

        // Para otros errores, mostrar y lanzar excepción
        const errorType = getErrorType(error);
        errorStore.showError(errorMessage, errorType);
        console.error('Login error:', errorMessage, error);
        throw new Error(errorMessage);
    }
};

export const authRegister = async (email: string, password: string, fullName: string): Promise<boolean> => {
    email = email.toLowerCase().trim();
    try {
        await ditoApi.post<RegisterResponse>('/auth/register', {
            email,
            password,
            fullName
        });

        // Mostrar mensaje de éxito
        const errorStore = useErrorStore.getState();
        errorStore.showError('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', 'success');

        return true;
    } catch (error: any) {
        // Extraer mensaje de error
        const errorMessage = extractErrorMessage(error);
        const errorStore = useErrorStore.getState();
        
        // Mostrar error al usuario (todos los errores de registro son relevantes)
        errorStore.showError(errorMessage, 'warning');

        console.log('Register error (showing to user):', errorMessage);
        return false;
    }
};


export const authValidateToken = async (deviceToken: string): Promise<{ user: User, token: string, refreshToken: string } | null> => {
    try {
        const url = deviceToken ? `/auth/check-status?deviceToken=${deviceToken}` : '/auth/check-status';
        const { data } = await ditoApi.get<LoginResponse>(url);
        console.log(data)
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
        //console.error('Token validation error:', message, error);
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



interface SetMainDeviceResponse {
    deviceToken: string;
    isMainDevice: true;
    message: string;
    requiresConfirmation: false;

}

export const setMainDevice = async (deviceToken: string): Promise<SetMainDeviceResponse | null> => {
    try {
        const { data } = await ditoApi.post<SetMainDeviceResponse>('/auth/set-main-device', { deviceToken });
        return data;
    } catch (error: any) {
        let message = 'Error verificando dispositivo principal.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Check main device error:', message, error);
        return null;
    }
};


export const refreshToken = async (deviceToken: string) => {
    try {
        const { data } = await ditoApi.post<LoginResponse>('/auth/refresh-token', { deviceToken });
        return data;
    } catch (error: any) {
        let message = 'Error al refrescar el token.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Refresh token error:', message, error);
        return null;
    }
};
