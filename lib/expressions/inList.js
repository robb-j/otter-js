
/** @type QueryExpression  */
module.exports = function(expr, attr) {
  if (!Array.isArray(expr)) return false
  return expr.reduce((correct, val) => {
    return correct && attr.valueMatchesType(val)
  }, true)
}
