import uWS from 'uWebSockets.js';
import { Request } from './http/Request';
import { Response } from './http/Response';
export declare function Middleware(req: Request, res: Response, next: Function): void;
export interface BodyParserRequest extends Request {
    raw: Buffer;
    text: string;
    body?: object;
}
export declare function BodyParserMiddleware(req: BodyParserRequest, res: Response, next: Function): void;
export interface HttpError extends Error {
    status: number;
}
export interface App {
    /** access to the uWs App Instance */
    app: uWS.TemplatedApp;
    /** Listens to hostname & port. Callback hands either false or a listen socket. */
    listen(host: uWS.RecognizedString, port: number): Promise<uWS.us_listen_socket | false>;
    /** Listens to port. Callback hands either false or a listen socket. */
    listen(port: number): Promise<uWS.us_listen_socket | false>;
    /** Listens to port and sets Listen Options. Callback hands either false or a listen socket. */
    listen(port: number, options: uWS.ListenOptions): Promise<uWS.us_listen_socket | false>;
    /** Close app */
    close(): Promise<void>;
    /** Registers pre-handler for all following HTTP handlers */
    use(...handlers: (typeof Middleware)[]): App;
    /** Registers an HTTP GET handlers matching specified URL pattern. */
    get(pattern: string, ...handlers: (typeof Middleware)[]): App;
    /** Registers an HTTP POST handlers matching specified URL pattern. */
    post(pattern: string, ...handlers: (typeof Middleware)[]): App;
    /** Registers an HTTP OPTIONS handlers matching specified URL pattern. */
    options(pattern: string, ...handlers: (typeof Middleware)[]): App;
    /** Registers an HTTP DELETE handlers matching specified URL pattern. */
    del(pattern: string, ...handlers: (typeof Middleware)[]): App;
    /** Registers an HTTP PATCH handlers matching specified URL pattern. */
    patch(pattern: string, ...handlers: (typeof Middleware)[]): App;
    /** Registers an HTTP PUT handlers matching specified URL pattern. */
    put(pattern: string, ...handlers: (typeof Middleware)[]): App;
    /** Registers an HTTP HEAD handlers matching specified URL pattern. */
    head(pattern: string, ...handlers: (typeof Middleware)[]): App;
    /** Registers an HTTP CONNECT handlers matching specified URL pattern. */
    connect(pattern: string, ...handlers: (typeof Middleware)[]): App;
    /** Registers an HTTP TRACE handlers matching specified URL pattern. */
    trace(pattern: string, ...handlers: (typeof Middleware)[]): App;
    /** Registers an HTTP handlers matching specified URL pattern on any HTTP method. */
    any(pattern: string, ...handlers: (typeof Middleware)[]): App;
    /** Registers a handlers matching specified URL pattern where WebSocket upgrade requests are caught. */
    ws(pattern: uWS.RecognizedString, behavior: uWS.WebSocketBehavior<any>): App;
    /** Publishes a message under topic, for all WebSockets under this app. See WebSocket.publish. */
    publish(topic: uWS.RecognizedString, message: uWS.RecognizedString, isBinary?: boolean, compress?: boolean): boolean;
    /** Returns number of subscribers for this topic. */
    numSubscribers(topic: uWS.RecognizedString): number;
    /** Adds a server name. */
    addServerName(hostname: string, options: uWS.AppOptions): App;
    /** Removes a server name. */
    removeServerName(hostname: string): App;
    /** Registers a synchronous callback on missing server names. See /examples/ServerName.js. */
    missingServerName(cb: (hostname: string) => void): App;
}
export interface AppOptions extends uWS.AppOptions {
    /**
     * If `true` uses uWs.SSLApp instead of uWs.App
     */
    isSsl?: boolean;
    /**
     * If `false` default response header `uwebsocket: <version>` is written
     * @default false
     */
    isSilent?: boolean;
    /**
     * Changes the final handler.
     * Is called on all `connect` routes where the response has not yet ended.
     */
    finalHandler?: (err: Error | HttpError | undefined | null, req: Request, res: Response) => void;
}
