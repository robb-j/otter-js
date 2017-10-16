/**
 * Gets the class of an object
 * @param  {Object} object The object to get the class of
 * @return {Class}
 */
module.exports = function getClass(object) {
  return object.constructor
}
