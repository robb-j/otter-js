
let logicOps = [ 'and', 'or' ]

/**
 * Validates 'logical' expressions, e.g. { and: [ exprA, exprB ] }
 * @type LogicalExpression
 * @param  {any} expr The expression to check
 * @param  {String} type The type to check against
 * @return {Boolean}
 */
module.exports = function(value, type) {
  if (typeof value !== 'object') return false
  let keys = Object.keys(value)
  if (keys.length !== 1) return false
  let op = keys[0]
  let exprs = value[op]
  if (!logicOps.includes(op) || !Array.isArray(exprs)) return false
  
  for (let i in exprs) {
    exprs[i] = this.validateExpr(exprs[i], type)
    if (exprs[i] === null) return false
  }
  
  return true
}
