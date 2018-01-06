const opMap = {
  '>': '$gt',
  '<': '$lt',
  '>=': '$gte',
  '<=': '$lte'
}

/** @type MongoExprProcessor  */
module.exports = function(key, attr, expr) {
  let op = Object.keys(expr)[0]
  return {
    [key]: {
      [opMap[op]]: attr.prepareValueForQuery(expr[op])
    }
  }
}
