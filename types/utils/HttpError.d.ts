export class HttpError extends Error {
    /**
     * @param {number} [status=500]
     * @param {string} [message]
     * @param {Error} [err]
     */
    constructor(status?: number, message?: string, err?: Error);
    status: number;
    error: Error | undefined;
    stack: string | undefined;
}
