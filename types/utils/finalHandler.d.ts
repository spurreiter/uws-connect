export function finalHandler(err: HttpError | Error | undefined | null, res: Response): void;
export type Response = import('../http/Response.js').Response;
export type HttpError = import('../utils/HttpError.js').HttpError;
