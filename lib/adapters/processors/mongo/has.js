
/** @type MongoExprProcessor */
module.exports = function(key, attr, expr) {
  
  return Object.keys(expr).reduce((nested, subkey) => {
    return Object.assign(nested, this.evaluateExpr(`${key}.${subkey}`, expr[subkey]))
  }, {})
}
