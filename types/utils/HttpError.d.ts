export class HttpError extends Error {
    /**
     * @param {number} [status=500]
     * @param {string} [message]
     * @param {Error} [err]
     */
    constructor(status?: number | undefined, message?: string | undefined, err?: Error | undefined);
    status: number;
    error: Error | undefined;
    stack: string | undefined;
}
