const opMap = {
  '>': '$gt',
  '<': '$lt',
  '>=': '$gte',
  '<=': '$lte'
}

/** @type MongoExprProcessor  */
module.exports = function(attr, expr) {
  let op = Object.keys(expr)[0]
  return { [attr.name]: {
    [opMap[op]]: expr[op]
  }}
}
