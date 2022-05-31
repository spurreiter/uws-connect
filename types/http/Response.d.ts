/// <reference types="node" />
export class Response extends Writable {
    /**
     * @param {uWs.HttpResponse} uwsRes
     * @param {Request} req
     * @param {WritableOptions} [options]
     */
    constructor(uwsRes: uWs.HttpResponse, req: Request, options?: import("stream").WritableOptions | undefined);
    _uwsRes: import("uWebSockets.js").HttpResponse;
    _req: import("./Request.js").Request;
    _headers: {};
    _status: number;
    headersSent: boolean;
    finished: boolean;
    /**
     * sets response status code
     * @param {number} status
     */
    set statusCode(arg: number);
    /**
     * set response status code
     * @returns {number}
     */
    get statusCode(): number;
    /**
     * get response header value
     * @param {string} key
     * @returns {any}
     */
    getHeader(key: string): any;
    /**
     * set response header
     * @param {string} key
     * @param {string|number} value
     */
    setHeader(key: string, value: string | number): void;
    /**
     * remove response header by key
     * @param {string} key
     */
    removeHeader(key: string): void;
    /**
     * write headers only before end or the first write
     * @private
     */
    private _writeHeaders;
    /**
     * set cookie
     * @param {string} name
     * @param {string} value
     * @param {import('cookie').CookieSerializeOptions} options
     */
    cookie(name: string, value?: string, options?: import('cookie').CookieSerializeOptions): void;
    /**
     * clear cookie
     * @param {string} name
     * @param {import('cookie').CookieSerializeOptions} options
     */
    clearCookie(name: string, options: import('cookie').CookieSerializeOptions): void;
    /**
     * drained write to uWs.HttpResponse
     * @param {string|Buffer} chunk
     * @returns {boolean} `false` if chunk was not or only partly written
     */
    write(chunk: string | Buffer): boolean;
    /**
     * Writable _write implementation
     * @param {string|Buffer} chunk
     * @param {string} encoding (ignored)
     * @param {Function} callback
     */
    _write(chunk: string | Buffer, encoding: string, callback: Function): void;
    /**
     * end a request (without backpressure handling).
     * use `res.send` if backpressure handling is needed.
     * @param {string|Buffer} body
     * @param {boolean} [closeConnection]
     */
    end(body: string | Buffer, closeConnection?: boolean | undefined): void;
    /**
     * drained write with end to uWs.HttpResponse
     * @param {string|Buffer} body
     * @returns {boolean} `false` if body was not or only partly written
     */
    tryEnd(body: string | Buffer): boolean;
    /**
     * send a response
     * @param {string|Buffer|object|null|boolean|number} data
     * @param {number} [status]
     * @param {object} [headers]
     */
    send(data: string | Buffer | object | null | boolean | number, status?: number | undefined, headers?: object): void;
    /**
     * @private
     */
    private _finish;
}
export type WritableOptions = import('node:stream').WritableOptions;
export namespace uWs {
    type HttpRequest = import('uWebSockets.js').HttpRequest;
    type HttpResponse = import('uWebSockets.js').HttpResponse;
}
export type Request = import('./Request.js').Request;
import { Writable } from "stream";
