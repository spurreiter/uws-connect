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
     /** Registers an HTTP GET handler matching specified URL pattern. */
     get(pattern: uWS.RecognizedString, handler: (res: uWS.HttpResponse, req: uWS.HttpRequest) => void) : App;
     /** Registers an HTTP POST handler matching specified URL pattern. */
     post(pattern: uWS.RecognizedString, handler: (res: uWS.HttpResponse, req: uWS.HttpRequest) => void) : App;
     /** Registers an HTTP OPTIONS handler matching specified URL pattern. */
     options(pattern: uWS.RecognizedString, handler: (res: uWS.HttpResponse, req: uWS.HttpRequest) => void) : App;
     /** Registers an HTTP DELETE handler matching specified URL pattern. */
     del(pattern: uWS.RecognizedString, handler: (res: uWS.HttpResponse, req: uWS.HttpRequest) => void) : App;
     /** Registers an HTTP PATCH handler matching specified URL pattern. */
     patch(pattern: uWS.RecognizedString, handler: (res: uWS.HttpResponse, req: uWS.HttpRequest) => void) : App;
     /** Registers an HTTP PUT handler matching specified URL pattern. */
     put(pattern: uWS.RecognizedString, handler: (res: uWS.HttpResponse, req: uWS.HttpRequest) => void) : App;
     /** Registers an HTTP HEAD handler matching specified URL pattern. */
     head(pattern: uWS.RecognizedString, handler: (res: uWS.HttpResponse, req: uWS.HttpRequest) => void) : App;
     /** Registers an HTTP CONNECT handler matching specified URL pattern. */
     connect(pattern: uWS.RecognizedString, handler: (res: uWS.HttpResponse, req: uWS.HttpRequest) => void) : App;
     /** Registers an HTTP TRACE handler matching specified URL pattern. */
     trace(pattern: uWS.RecognizedString, handler: (res: uWS.HttpResponse, req: uWS.HttpRequest) => void) : App;
     /** Registers an HTTP handler matching specified URL pattern on any HTTP method. */
     any(pattern: uWS.RecognizedString, handler: (res: uWS.HttpResponse, req: uWS.HttpRequest) => void) : App;
     /** Registers a handler matching specified URL pattern where WebSocket upgrade requests are caught. */
     ws(pattern: uWS.RecognizedString, behavior: uWS.WebSocketBehavior) : App;
     /** Publishes a message under topic, for all WebSockets under this app. See WebSocket.publish. */
     publish(topic: uWS.RecognizedString, message: uWS.RecognizedString, isBinary?: boolean, compress?: boolean) : boolean;
     /** Returns number of subscribers for this topic. */
     numSubscribers(topic: uWS.RecognizedString) : number;
     /** Adds a server name. */
     addServerName(hostname: string, options: AppOptions): App;
     /** Removes a server name. */
     removeServerName(hostname: string): App;
     /** Registers a synchronous callback on missing server names. See /examples/ServerName.js. */
     missingServerName(cb: (hostname: string) => void): App;
 }
 export type AppOptions = import('./types.d').AppOptions;
 import uWS from "uWebSockets.js";
 