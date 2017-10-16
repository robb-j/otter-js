/**
 * Traverses a class heirachy to collect static attributes from each class
 * @param  {class} classRef The class to start from
 * @param  {String} property The property to get values from
 * @return {Object} The collected property values, with subclasses taking priority
 */
module.exports = function collectObjectProperty(classRef, property) {
  
  let values = {}
  
  let current = classRef
  
  do {
    values = Object.assign(current[property](), values)
    current = Object.getPrototypeOf(current)
  }
  while (current.name !== '')
  
  return values
}
