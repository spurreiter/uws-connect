/** @typedef {import('./types.d').AppOptions} AppOptions */
/**
 * A uWs App wrapper for connect compatible middlewares
 * @param {AppOptions} [options]
 * @returns {App}
 */
export function App(options?: import("./types.d").AppOptions | undefined): App;
export class App {
    /** @typedef {import('./types.d').AppOptions} AppOptions */
    /**
     * A uWs App wrapper for connect compatible middlewares
     * @param {AppOptions} [options]
     * @returns {App}
     */
    constructor(options?: import("./types.d").AppOptions | undefined);
    app: uWS.TemplatedApp | undefined;
    address: (() => {
        port: number;
    } | undefined) | undefined;
    listen: ((...args: any[]) => Promise<any>) | undefined;
    close: (() => Promise<void>) | undefined;
}
export type AppOptions = import('./types.d').AppOptions;
import uWS from "uWebSockets.js";
