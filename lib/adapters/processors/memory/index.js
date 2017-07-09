/**
 * A processor for a MemoryAdapter, used to evaluate a type of expression
 * @typedef MemoryExprProcessor
 * @type {function}
 * @param {object} expr The expression to evaluate
 * @param {any} value The value to evaluate against
 * @return {boolean} If the value matched the expression
 */

/** The defualt memory Processors */
module.exports = require('require-directory')(module)
