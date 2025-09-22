/**
 * Extrae el mensaje de error más apropiado de una respuesta de error
 */
export const extractErrorMessage = (error: any): string => {
    // Si hay un mensaje específico en la respuesta de la API
    if (error.response?.data?.message) {
        const message = error.response.data.message;
        
        // Si el mensaje es un array, unirlo con saltos de línea o comas
        if (Array.isArray(message)) {
            return message.join('\n');
        }
        
        return message;
    }
    
    // Si hay un mensaje en el error general
    if (error.message) {
        return error.message;
    }
    
    // Mensajes por defecto basados en el código de estado
    if (error.response?.status) {
        switch (error.response.status) {
            case 400:
                return 'Datos inválidos. Revisa la información ingresada.';
            case 401:
                return 'Credenciales incorrectas.';
            case 403:
                return 'No tienes permisos para realizar esta acción.';
            case 404:
                return 'Recurso no encontrado.';
            case 422:
                return 'Los datos proporcionados no son válidos.';
            case 429:
                return 'Demasiados intentos. Espera un momento.';
            case 500:
                return 'Error interno del servidor.';
            case 503:
                return 'Servicio no disponible temporalmente.';
            default:
                return 'Ocurrió un error inesperado.';
        }
    }
    
    return 'Ocurrió un error inesperado.';
};

/**
 * Determina si un error debe mostrarse al usuario o manejarse silenciosamente
 */
export const shouldShowError = (error: any): boolean => {
    // Errores que se manejan silenciosamente (generalmente para validaciones)
    const silentStatusCodes = [400, 401, 403];
    
    return !silentStatusCodes.includes(error.response?.status);
};

/**
 * Obtiene el tipo de alerta basado en el código de estado
 */
export const getErrorType = (error: any): 'error' | 'warning' | 'success' => {
    const status = error.response?.status;
    
    if (status >= 500) {
        return 'error'; // Errores de servidor
    } else if (status >= 400) {
        return 'warning'; // Errores de cliente
    }
    
    return 'error';
};