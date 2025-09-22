export interface LoginResponse {
    id:                    string;
    email:                 string;
    fullName:              string;
    isActive:              boolean;
    roles:                 string[];
    foundDeviceToken:      FoundDeviceToken;
    allowMultipleSessions: boolean;
    token:                 string;
    refreshToken:          string;
    secureTokenSet:        boolean;
}

export interface FoundDeviceToken {
    deviceToken:      string;
    isActive:         boolean;
    sessionId:        string;
    biometricEnabled: boolean;
    message:          string;
}

export interface RegisterResponse {
    message: string;
    jobId: string;
    status: string;
    estimatedProcessingTime: string;
    note: string;
}

export interface JobStatusResponse extends LoginResponse {
    jobStatus: 'pending' | 'completed' | 'failed';
}
