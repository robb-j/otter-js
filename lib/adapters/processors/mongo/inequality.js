/** @type MongoExprProcessor  */
module.exports = function(key, attr, expr) {
  return {
    [key]: { $ne: attr.prepareValueForQuery(expr['!']) }
  }
}
