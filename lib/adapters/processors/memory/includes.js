/** @type MemoryExprProcessor */
module.exports = function(expr, value) {
  return value.some(elem => {
    return Object.keys(expr).every(subkey => {
      return this.evaluateExpr(expr[subkey], elem[subkey])
    })
  })
}
