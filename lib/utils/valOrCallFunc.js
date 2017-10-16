/**
 * Util to either call a function and return its value or return the value, depending on whats passed
 * @param  {any|function} value The thing to call or return
 * @return {any} The value or result from calling it (if a function)
 */
module.exports = function valOrCallFunc(value) {
  return typeof value === 'function' ? value() : value
}
