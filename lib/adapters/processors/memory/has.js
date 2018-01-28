/** @type MemoryExprProcessor */
module.exports = function(expr, value) {
  return Object.keys(expr).every(subkey => {
    return this.evaluateExpr(expr[subkey], value[subkey])
  })
}
