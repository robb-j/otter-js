
/**
 * Validates 'equality' expressions, e.g. 7 or 'a string'
 * @type ValueExpression
 * @param  {any} expr The expression to check
 * @param  {String} type The type to check against
 * @return {Boolean}
 */
module.exports = function(value, type) {
  return typeof value === type
}
