

class Adapter {
  
  
  get name() { return this._name }
  get options() { return this._options }
  get models() { return this._models }
  
  constructor(options) {
    options = options || {}
    this._name = options.name || 'default'
    this._options = options
    this._models = {}
  }
  
  
  /** Called when an adapter is added to Otter */
  async setup(Otter) { }
  
  /** Called when an adapter is removed from Otter */
  async teardown(Otter) { }
  
  
  
  /** Custom check to see if this adapter supports an attribute */
  supportsAttribute(attribute) { return false }
  
  
  
  /** Finds existing model(s) */
  find(query) { }
  
  /** Creates a new model */
  create(modelName, values) { }
  
  /** Updates existing model(s) */
  update(query, values) { }
  
  /** Destroys existing model(s) */
  destroy(query) { }
  
}


Adapter._models = {}


module.exports = Adapter
