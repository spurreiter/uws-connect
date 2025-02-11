/** @typedef {import('./types').AppOptions} AppOptions */
/**
 * A uWs App wrapper for connect compatible middlewares
 * @param {AppOptions} [options]
 * @returns {import('./types').App}
 */
export function App(options?: AppOptions): import("./types").App;
export class App {
    /** @typedef {import('./types').AppOptions} AppOptions */
    /**
     * A uWs App wrapper for connect compatible middlewares
     * @param {AppOptions} [options]
     * @returns {import('./types').App}
     */
    constructor(options?: AppOptions);
    app: uWS.TemplatedApp | undefined;
    address: (() => {
        port: number;
    } | undefined) | undefined;
    /**
     * Listens to hostname & port. Callback hands either false or a listen socket.
     * @param {[host: uWS.RecognizedString, port: number]|[port: number]|[port: number, options: uWS.ListenOptions]} args
     * @returns {Promise<uWS.us_listen_socket>}
     */
    listen: ((...args: [host: uWS.RecognizedString, port: number] | [port: number] | [port: number, options: uWS.ListenOptions]) => Promise<uWS.us_listen_socket>) | undefined;
    /**
     * Close listening socket
     * @returns {Promise<void>}
     */
    close: (() => Promise<void>) | undefined;
    use: ((...handlers: any[]) => this) | undefined;
}
export type AppOptions = import("./types").AppOptions;
import uWS from 'uWebSockets.js';
