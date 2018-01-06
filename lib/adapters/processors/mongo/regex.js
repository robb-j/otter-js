/** @type MongoExprProcessor  */
module.exports = function(key, attr, expr) {
  return {
    [key]: { $regex: attr.prepareValueForQuery(expr) }
  }
}
