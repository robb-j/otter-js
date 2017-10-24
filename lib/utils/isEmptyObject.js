/**
 * If an object has any enumerable objects
 * @param  {object}  object The object to check
 * @return {Boolean}
 */
module.exports = function isEmptyObject(object) {
  return Object.keys(object).length === 0
}
