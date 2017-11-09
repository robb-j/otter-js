/**
 * Fetches a value from an object using dot notation (the.hairy.wizzard)
 * @param  {string} key    The dot-notation key to fetch by
 * @param  {object} object The object to fetch from
 * @return {any}           Whatever matched the key or null if not found
 */
module.exports = function getUsingDot(key, object) {
  
  let current = object
  let keys = key.split('.')
  
  for (let subKey of keys) {
    if (!current[subKey]) return null
    current = current[subKey]
  }
  return current
}
