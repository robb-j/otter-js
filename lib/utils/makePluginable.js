

function makePluginable(target, active = {}) {
  
  
  // Add a list to store plugins on the active record
  active.plugins = []
  
  
  // Put the active record onto the target
  // target._active = active
  
  
  // Add a getter for the active record
  Object.defineProperty(target, 'active', { value: active })
  
  
  // Add the use function to the target
  target.use = function(plugin, ...args) {
    
    // If passed a function, convert the shorthand
    if (typeof plugin === 'function') { plugin = { install: plugin } }
    
    // Fail if an invalid plugin was passed
    if (typeof plugin !== 'object' || typeof plugin.install !== 'function') {
      throw new Error('Invalid Plugin')
    }
    
    // Store the plugin
    this.active.plugins.push(plugin)
    
    // Install the plugin, passing the target as the first arguement.
    // The subsequent arguements are those passed to .use
    plugin.install.apply(plugin, [this].concat(args))
    
    // Return the target for chaining
    return this
  }
  
  
  
  
}




module.exports = makePluginable
