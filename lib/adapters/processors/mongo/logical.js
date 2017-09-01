
const opMap = {
  and: '$and',
  or: '$or'
}

/** @type MongoExprProcessor  */
module.exports = function(attr, expr) {
  
  let op = Object.keys(expr)[0]
  
  let subExprs = expr[op].map(subExpr => {
    return this.evaluateExpr(attr, subExpr)
  })
  
  return {
    [opMap[op]]: subExprs
  }
}
