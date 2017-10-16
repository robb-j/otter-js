/**
 * Sets a value onto an object, throwing an error if it already exists
 * @param {any} value The value to set
 * @param {String} key The key to set the value to
 * @param {Object} object The object to set the value on
 * @param {String} error The message of the error to throw
 */
module.exports = function setOrError(value, key, object, error) {
  
  // Throw an error if the value is already set
  if (object[key]) { throw new Error(error) }
  
  // Otherwise set the value
  object[key] = value
}
