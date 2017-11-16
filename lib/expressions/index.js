/**
 * The definition for a type of query that can be performed using Otter.Types.Query, defined by a function which validates if a value is eligable for use in the expression. These are paired with QueryProcessors which are installed on Adapters. This expression validates the values that can be used, then the processor with the same name converts the value to a raw query for the Adapter.
 * @typedef QueryExpression
 * @type {function}
 * @param {any} value The value to be evaluated
 * @param {Otter.Types.Attribute} attr The Atribute to validate against
 * @return {boolean} If the value is the correct structure for the expression
 */

/** The defualt Query Expressions */
module.exports = require('require-directory')(module)
