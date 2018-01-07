
let compOps = [ '<', '>', '>=', '<=' ]

/** @type QueryExpression  */
module.exports = function(value, attr) {
  if (attr.valueType !== 'number') return false
  if (typeof value !== 'object') return false
  let keys = Object.keys(value)
  if (keys.length !== 1) return false
  return compOps.includes(keys[0]) && attr.valueMatchesType(value[keys[0]])
}

module.exports.precedence = 11
