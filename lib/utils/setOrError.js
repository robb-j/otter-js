
function setOrError(value, key, object, error) {
  
  // Throw an error if the value is already set
  if (object[key]) { throw new Error(error) }
  
  // Otherwise set the value
  object[key] = value
}

module.exports = setOrError
