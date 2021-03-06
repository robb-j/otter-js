const OtterError = require('../errors/OtterError')

/**
 * Makes an object pluginable, giving it an 'active' record and use() function to run plugins
 * @param  {Object} target The object to make pluginable
 * @param  {Object} [active={}] The default active record
 * @return {Object} The target to allow for chaining
 */
module.exports = function makePluginable(target, active = {}) {
  
  
  // Add a list to store plugins on the active record
  active.plugins = []
  
  
  // Add a getter for the active record
  Object.defineProperty(target, 'active', { value: active })
  
  
  // Add the use function to the target
  target.use = function(plugin, ...args) {
    
    // If passed a function, convert the shorthand
    if (typeof plugin === 'function') { plugin = { install: plugin } }
    
    // Fail if an invalid plugin was passed
    if (typeof plugin !== 'object' || typeof plugin.install !== 'function') {
      throw OtterError.fromCode('config.invalidPlugin')
    }
    
    // Store the plugin
    this.active.plugins.push(plugin)
    
    // Install the plugin, passing the target as the first arguement.
    // The subsequent arguements are those passed to .use
    plugin.install.apply(plugin, [this].concat(args))
    
    // Return the target for chaining
    return this
  }
  
  
  // Add extend to target
  target.extend = function() {
    let pup = Object.assign({}, this)
    
    // Make a shallow copy of the active record
    pup.active = {}
    for (let prop in this.active) {
      
      // Copy arrays
      if (Array.isArray(this.active[prop])) {
        pup.active[prop] = this.active[prop].slice()
      }
      
      // Copy objects
      else if (typeof this.active[prop] === 'object') {
        pup.active[prop] = Object.assign({}, this.active[prop])
      }
    }
    
    // Return the child for chaining
    return pup
  }
}
