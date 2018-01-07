
/** @type MongoExprProcessor */
module.exports = function(key, attr, expr) {
  
  let nested = Object.keys(expr).reduce((nested, subkey) => {
    return Object.assign(nested, this.evaluateExpr(subkey, expr[subkey]))
  }, {})
  
  return {
    [key]: {
      $elemMatch: nested
    }
  }
}
