/// <reference types="node" />
/** @typedef {import('node:stream').ReadableOptions} ReadableOptions */
/** @typedef {import('uWebSockets.js').HttpRequest} uWs.HttpRequest */
/** @typedef {import('uWebSockets.js').HttpResponse} uWs.HttpResponse */
export class Request extends Readable {
    /**
     * @param {uWs.HttpResponse} uwsRes
     * @param {uWs.HttpRequest} uwsReq
     * @param {ReadableOptions} [options]
     */
    constructor(uwsRes: uWs.HttpResponse, uwsReq: uWs.HttpRequest, options?: import("stream").ReadableOptions | undefined);
    _uwsReq: import("uWebSockets.js").HttpRequest;
    _uwsRes: import("uWebSockets.js").HttpResponse;
    headers: {};
    params: {};
    method: string;
    connection: {};
    socket: {};
    set url(arg: any);
    /**
     * request url
     */
    get url(): any;
    _url: any;
    /**
     * request query
     *
     * uses [qs](https://www.npmjs.com/package/qs) for query string parsing
     *
     * @returns {object}
     */
    get query(): any;
    /**
     * get parsed cookies
     * @returns {object}
     */
    get cookies(): any;
    _read(size: any): void;
    /**
     * pauses stream
     */
    pause(): Request;
    /**
     * resumes stream
     */
    resume(): Request;
    /**
     * get `uWs.HttpRequest.getParameter()`
     * @param {number} index
     * @returns {string}
     */
    getParameter(index: number): string;
}
export type ReadableOptions = import('node:stream').ReadableOptions;
export namespace uWs {
    type HttpRequest = import('uWebSockets.js').HttpRequest;
    type HttpResponse = import('uWebSockets.js').HttpResponse;
}
import { Readable } from "stream";
