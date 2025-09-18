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

    return { user, token: data.token };
}


export const authLogin = async (email: string, password: string, deviceToken: string) => {
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
