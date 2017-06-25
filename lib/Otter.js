
let Otter = {
  
  plugins: [],
  
  /**
   * Adds a plugin to Otter
   * @param {function|Object} plugin The plugin to install
   * @param {any} args Extra arguements to pass to the plugin
   * @return {Otter} Returns 'this' for chaining
   */
  use(plugin, ...args) {
    
    if (typeof plugin === 'function') {
      plugin = { install: plugin }
    }
    
    if (typeof plugin !== 'object' || typeof plugin.install !== 'function') {
      throw new Error('Invalid Plugin')
    }
    
    
    // Store the plugin for later
    this.plugins.push(plugin)
    
    
    // Call install on the plugin, with modified parameters
    // -> this = the plugin (as expected)
    // -> 1st param is ourself (Otter)
    // -> remaining params are the extra ones passed to .use(...)
    plugin.install.apply(
      plugin,
      [ this ].concat(args)
    )
    
    
    // Return this for chaining
    return this
  },
  
  extend() {
    let sub = Object.assign({}, Otter)
    sub.plugins = this.plugins.slice()
    return sub
  }
}


module.exports = Otter
