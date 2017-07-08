
let compOps = [ '<', '>', '>=', '<=' ]

/**
 * Validates 'comparison' expressions, e.g. { '>': 7 }
 * @type InListExpression
 * @param  {any} expr The expression to check
 * @param  {String} type The type to check against
 * @return {Boolean}
 */
module.exports = function(value, type) {
  if (type !== 'number') return false
  if (typeof value !== 'object') return false
  let keys = Object.keys(value)
  if (keys.length !== 1) return false
  return compOps.includes(keys[0]) && typeof value[keys[0]] === type
}
