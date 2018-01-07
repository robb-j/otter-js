
const notOps = [ '!' ]

/** @type QueryExpression  */
module.exports = function(value, attr) {
  if (typeof value !== 'object') return false
  let keys = Object.keys(value)
  if (keys.length !== 1) return false
  return notOps.includes(keys[0]) && attr.valueMatchesType(value[keys[0]])
}

module.exports.precedence = 12
