/** @type MongoExprProcessor  */
module.exports = function(key, attr, expr) {
  return {
    [key]: { $in: expr.map(v => attr.prepareValueForQuery(v)) }
  }
}
