
let compOps = [ '<', '>', '>=', '<=' ]

module.exports = function(value, type) {
  if (type !== 'number') return false
  if (typeof value !== 'object') return false
  let keys = Object.keys(value)
  if (keys.length !== 1) return false
  return compOps.includes(keys[0]) && typeof value[keys[0]] === type
}
