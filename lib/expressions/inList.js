
module.exports = function(value, type) {
  if (!Array.isArray(value)) return false
  return value.reduce((correct, val) => {
    return correct && typeof val === type
  }, true)
}
