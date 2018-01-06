/**
 * A processor for a MongoAdapter, used to convert a query expression on an attribute into a mongo query
 * @typedef MongoExprProcessor
 * @type {function}
 * @param {string} key The identifier representing this expression
 * @param {Otter.Types.Attribute} attr The attribut being evaluated
 * @param {Expr} expr The expression being executed
 * @return {object} The mongo query representing that expression
 */

/**  The defualt mongo Processors */
module.exports = require('require-directory')(module)
