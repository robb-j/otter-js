
/**
 * Validates 'regex' expressions, e.g. /some regex/
 * @type RegexExpression
 * @param  {any} expr The expression to check
 * @param  {String} type The type to check against
 * @return {Boolean}
 */
module.exports = function(value, type) {
  return type === 'string' && value instanceof RegExp
}
