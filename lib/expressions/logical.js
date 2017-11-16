
let logicOps = [ 'and', 'or' ]

/** @type QueryExpression  */
module.exports = function(value, attr) {
  if (typeof value !== 'object') return false
  let keys = Object.keys(value)
  if (keys.length !== 1) return false
  let op = keys[0]
  let exprs = value[op]
  if (!logicOps.includes(op) || !Array.isArray(exprs)) return false
  
  for (let i in exprs) {
    exprs[i] = this.validateExpr(exprs[i], attr)
    if (exprs[i] === null) return false
  }
  
  return true
}
