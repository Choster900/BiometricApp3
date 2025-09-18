import { ditoApi } from "../../config/ditoApi";


interface GenerateDeviceTokenResponse {
    deviceToken: string;
    message: string;
    note: string;
}

export const generateDeviceToken = async (): Promise<GenerateDeviceTokenResponse | null> => {
    try {
        const { data } = await ditoApi.post<GenerateDeviceTokenResponse>('/auth/generate-device-token');
        return data;
    } catch (error: any) {
        if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
            console.log('Generate device token: Authentication error (silent)');
            return null;
        }

        let message = 'Error generando token de dispositivo.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Generate device token error:', message, error);
        return null;
    }
};

export const saveDeviceToken = async (deviceToken: string): Promise<boolean> => {
    try {
        await ditoApi.post('/auth/save-device-token', { deviceToken });
        return true;
    } catch (error: any) {
        let message = 'Error guardando token de dispositivo.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Save device token error:', message, error);
        return false;
    }
};

export const toggleBiometrics = async (enable: boolean, deviceToken: string): Promise<boolean> => {
    try {
        await ditoApi.post('/auth/toggle-biometrics', { enable, deviceToken });
        console.log('Biometrics toggled successfully');
        return true;
    } catch (error: any) {
        let message = 'Error toggling biometría.';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }
        console.error('Disable biometrics error:', message, error);
        return false;
    }
};
