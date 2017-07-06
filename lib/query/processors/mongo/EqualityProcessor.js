
module.exports = function(key, value, attribute) {
  
  // If the types match, return the value
  if (typeof value === attribute.valueType) {
    return value
  }
  
  // Otherwise, fail
  return null
}
