
function collectObjectProperty(className, property) {
  
  let values = {}
  
  let current = className
  
  do {
    values = Object.assign(current[property](), values)
    current = Object.getPrototypeOf(current)
  }
  while (current.name !== '')
  
  return values
}

module.exports = collectObjectProperty
