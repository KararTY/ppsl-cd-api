/**
 * **Only usable when route has the postHistoryExists middleware.**
 * @param {Fastify.Request} request
 * @returns {Awaited<ReturnType<import('./postHistory.service.js').postHistoryById>>}
 */
export function getMiddlewarePostHistory (request) {
  return request.postHistory
}
