export class Response extends Writable {
    /**
     * @param {uWs.HttpResponse} uwsRes
     * @param {Request} req
     * @param {WritableOptions} [options]
     */
    constructor(uwsRes: uWs.HttpResponse, req: Request, options?: WritableOptions);
    _uwsRes: import("uWebSockets.js").HttpResponse;
    _req: import("./Request.js").Request;
    _headers: {};
    _status: number;
    headersSent: boolean;
    finished: boolean;
    _readStream: import("stream").Readable;
    /**
     * sets response status code
     * @param {number} status
     */
    set statusCode(status: number);
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
     * set cookie
     * @param {string} name
     * @param {string} value
     * @param {import('cookie').SerializeOptions} options
     */
    cookie(name: string, value?: string, options?: import("cookie").SerializeOptions): void;
    /**
     * clear cookie
     * @param {string} name
     * @param {import('cookie').SerializeOptions} options
     */
    clearCookie(name: string, options: import("cookie").SerializeOptions): void;
    /**
     * write headers only before end or the first write
     * @private
     */
    private _writeHeaders;
    /**
     * @param {Buffer} chunk
     * @returns {boolean} `false` if body was not or only partly written
     */
    _writeBackPressure(chunk: Buffer): boolean;
    /**
     * drained write to uWs.HttpResponse
     * @param {string|Buffer} chunk
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
    end(body: string | Buffer, closeConnection?: boolean): void;
    /**
     * @param {Buffer} body
     * @returns {boolean} `false` if body was not or only partly written
     */
    _tryEndBackPressure(body: Buffer, totalLength: any): boolean;
    /**
     * drained write with end to uWs.HttpResponse
     * @param {string|Buffer} body
     */
    tryEnd(body: string | Buffer): true | undefined;
    /**
     * send a response
     * @param {string|Buffer|object|null|boolean|number} data
     * @param {number} [status]
     * @param {object} [headers]
     */
    send(data: string | Buffer | object | null | boolean | number, status?: number, headers?: object): void;
    /**
     * @private
     */
    private _finish;
}
export type WritableOptions = import("node:stream").WritableOptions;
export namespace uWs {
    type HttpRequest = import("uWebSockets.js").HttpRequest;
    type HttpResponse = import("uWebSockets.js").HttpResponse;
}
export type Request = import("./Request.js").Request;
import { Writable } from 'stream';
