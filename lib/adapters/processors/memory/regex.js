/** @type MemoryExprProcessor  */
module.exports = function(expr, value) {
  return expr.test(value)
}
