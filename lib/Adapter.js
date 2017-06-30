const { makePluginable } = require('./utils')

class Adapter {
  
  get name() { return this._name }
  get options() { return this._options }
  get models() { return this._models }
  get processors() { return this._processors }
  
  
  
  /** Creates a new adapter */
  constructor(options) {
    options = options || {}
    this._name = options.name || 'default'
    this._options = options
    this._models = {}
    this._processors = {
      where: [], sort: [], create: [], limit: [], pluck: []
    }
    
    makePluginable(this)
  }
  
  /** Called when an adapter is added to Otter */
  async setup(Otter) { }
  
  /** Called when an adapter is removed from Otter */
  async teardown(Otter) { }
  
  
  
  /** Adds a processor for the adapter to use */
  addProcessor(type, processor) {
    
    // Fail if not a function or incorrect arguements
    if (typeof processor !== 'function') {
      throw new Error('Invalid Processor: Should be a function')
    }
    
    // If a list isn't already created for that type, create one
    if (!this.processors[type]) this.processors[type] = []
    
    // Add the processor to the start of the list
    this.processors[type].unshift(processor)
  }
  
  
  
  /** Custom check to see if this adapter supports an attribute */
  supportsAttribute(attribute) { return false }
  
  
  
  validateQuery(modelName, query) {
    // Check all values in the query match up to model's attributes
  }
  
  validateModelValues(modelName, values) {
    // Check all values match up to model's attributes
    // Could even use model's validator?
  }
  
  
  
  /** Finds existing model(s) */
  find(modelName, query) { }
  
  /** Creates a new model */
  create(modelName, values) { }
  
  /** Updates existing model(s) */
  update(modelName, query, values) { }
  
  /** Destroys existing model(s) */
  destroy(modelName, query) { }
  
}


Adapter._models = {}


module.exports = Adapter
