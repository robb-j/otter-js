
let notOps = [ '!' ]

/**
 * Validates 'not' expressions, e.g. { '!': 'geoff' }
 * @type NotExpression
 * @param  {any} expr The expression to check
 * @param  {String} type The type to check against
 * @return {Boolean}
 */
module.exports = function(value, type) {
  if (typeof value !== 'object') return false
  let keys = Object.keys(value)
  if (keys.length !== 1) return false
  return notOps.includes(keys[0]) && typeof value[keys[0]] === type
}
