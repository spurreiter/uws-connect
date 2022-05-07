/**
 * A uWs App wrapper for connect compatible middlewares
 * @param {import('./types').AppOptions} [options]
 * @returns {import('./types').App}
 */
export function App(options?: import("./types").AppOptions | undefined): import('./types').App;
export class App {
    /**
     * A uWs App wrapper for connect compatible middlewares
     * @param {import('./types').AppOptions} [options]
     * @returns {import('./types').App}
     */
    constructor(options?: import("./types").AppOptions | undefined);
    app: uWs.TemplatedApp | undefined;
    listen: ((...args: any[]) => Promise<any>) | undefined;
    close: (() => Promise<void>) | undefined;
}
import uWs from "uWebSockets.js";
