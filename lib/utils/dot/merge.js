const undefOrNull = require('../undefOrNull')

module.exports = function mergeUsingDot(object, key, value) {
  
  let current = object
  
  // Loop the parts of the key
  let keys = key.split('.')
  keys.forEach((subkey, i) => {
    
    // If we're at the end of the list
    if (i === keys.length - 1) {
      
      // If not set, just set the valye
      if (undefOrNull(current[subkey])) {
        current[subkey] = value
      }
      else if (typeof current[subkey] === 'object') {
        
        // If already set and an object, merge it
        Object.assign(current[subkey], value)
      }
      else {
        
        // If set and not an object, fail
        throw new Error(`Cannot merge non-object - ${typeof current[subkey]} ${current[subkey]}`)
      }
    }
    else {
      
      // If not set, set it to an object
      if (undefOrNull(current[subkey])) {
        current[subkey] = {}
      }
      else if (typeof current[subkey] !== 'object') {
        
        // If set and not an object, fail
        throw new Error(`Cannot merge non-object - ${typeof current[subkey]} - ${current[subkey]}`)
      }
    }
    
    current = current[subkey]
  })
}
