const undefOrNull = require('../undefOrNull')

/**
 *  Sets a value onto an object using a dot-notation key
 * @param {object} object The object to set onto
 * @param {string} key    The dot notation key to set to
 * @param {any} value     The value to be set
 */
module.exports = function setUsingDot(object, key, value) {
  
  // Split the key up using dots
  let keys = key.split('.')
  
  // Keep a reference to the object being manipulated
  let current = object
  
  // Loop through each part of the key
  keys.forEach((subkey, i) => {
    
    // If not at the end and the value doesn't exist, set it to an empty object
    if (i < keys.length - 1 && undefOrNull(current[subkey])) {
      current[subkey] = {}
    }
    
    // If at the end, perform the set
    if (i === keys.length - 1) {
      current[subkey] = value
    }
    else {
      // Update the reference
      current = current[subkey]
    }
  })
  
}
