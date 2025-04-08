export function connect(options?: {
    isSsl?: boolean | undefined;
    finalHandler?: Function | undefined;
}): (...Middleware: any) => (res: uWS.HttpResponse, req: uWS.HttpRequest) => void;
export type Middleware = typeof import("./types.js").Middleware;
export type HttpError = import("./utils/HttpError.js").HttpError;
export namespace uWS {
    type HttpResponse = import("uWebSockets.js").HttpResponse;
    type HttpRequest = import("uWebSockets.js").HttpRequest;
}
