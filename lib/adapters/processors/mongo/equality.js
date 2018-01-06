/** @type MongoExprProcessor  */
module.exports = function(key, attr, expr) {
  return {
    [key]: attr.prepareValueForQuery(expr)
  }
}
