
module.exports = function(key, value, attribute) {
  
  if (Array.isArray(value)) {
    
    let correctType = value.reduce((correct, value) => {
      return correct && typeof value === attribute.valueType
    })
    
    if (correctType) {
      return { $in: value }
    }
    
    // IDEA: Some method of warnings
  }
  
  return null
}
