/**
 * body-parser for json and url-encoded data
 *
 * form data is parsed with [qs](https://www.npmjs.com/package/qs).
 *
 * @param {object} [options]
 * @param {number} [options.limit=1e6] max. content-length in bytes
 * @param {string} [options.type] default expected content-type
 * @returns {import('./types').BodyParserMiddleware}
 */
export function bodyParser(options?: {
    limit?: number | undefined;
    type?: string | undefined;
}): typeof import("./types").BodyParserMiddleware;
export const CONTENT_TYPE_JSON: "application/json";
export const CONTENT_TYPE_FORM: "application/x-www-form-urlencoded";
