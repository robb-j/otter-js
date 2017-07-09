/** @type MemoryExprProcessor  */
module.exports = function(expr, value) {
  return value !== (expr['!'] || expr['not'])
}
