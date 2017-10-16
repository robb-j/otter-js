/**
 * Whether a value is null or undefined
 * @param  {any} value The value to check
 * @return {Boolean}
 */
module.exports = function undefOrNull(value) {
  return value === null || value === undefined
}
