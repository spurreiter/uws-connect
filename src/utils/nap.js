/**
 * nap some milliseconds
 * @param {number} [ms=50] milliseconds
 * @returns
 */
export const nap = (ms = 50) =>
  new Promise((resolve) => setTimeout(() => resolve(undefined), ms))
