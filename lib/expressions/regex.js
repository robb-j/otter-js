
module.exports = function(value, type) {
  return type === 'string' && value instanceof RegExp
}
