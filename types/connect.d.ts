export function connect(options?: {
    finalHandler?: ((err: HttpError | Error | undefined | null, req: Request, res: Response) => void) | undefined;
}): (...Middleware: any[]) => (res: uWS.HttpResponse, req: uWS.HttpRequest) => void;
export type Middleware = typeof import("./types").Middleware;
export type HttpError = import('./utils/HttpError.js').HttpError;
export namespace uWS {
    type HttpResponse = import('uWebSockets.js').HttpResponse;
    type HttpRequest = import('uWebSockets.js').HttpRequest;
}
