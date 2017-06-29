
module.exports = function(value) {
  return typeof value === 'function' ? value() : value
}
