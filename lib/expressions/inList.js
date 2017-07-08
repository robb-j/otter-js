
/**
 * Validates 'inList' expressions, e.g. [ 'a', 'b', 'c' ]
 * @type InListExpression
 * @param  {any} expr The expression to check
 * @param  {String} type The type to check against
 * @return {Boolean}
 */
module.exports = function(expr, type) {
  if (!Array.isArray(expr)) return false
  return expr.reduce((correct, val) => {
    return correct && typeof val === type
  }, true)
}
