export class APIError extends Error {
    status?: number;
    data?: any;
    context?: string;

    constructor(message: string, status?: number, data?: any, context?: string) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
        this.context = context;
    }
}

export const handleAPIError = (error: any, context: string): APIError => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const message = error.response.data?.detail || error.response.data?.message || error.response.data?.error || `Error in ${context}`;
        return new APIError(message, error.response.status, error.response.data, context);
    } else if (error.request) {
        // The request was made but no response was received
        return new APIError('No response received from server', 0, null, context);
    } else {
        // Something happened in setting up the request that triggered an Error
        return new APIError(error.message || 'Request failed', 0, null, context);
    }
};
