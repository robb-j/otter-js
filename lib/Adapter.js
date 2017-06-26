

module.exports = class Adapter {
  
  constructor(options) {
    options = options || {}
    this.name = options.name || 'default'
    this.options = options
  }
  
  
  /** Called when an adapter is added to Otter */
  setup(Otter) { }
  
  /** Called when an adapter is removed from Otter */
  teardown(Otter) { }
  
  
  
  /** Finds existing model(s) */
  find(query) { }
  
  /** Creates a new model */
  create(modelName, values) { }
  
  /** Updates existing model(s) */
  update(query, values) { }
  
  /** Destroys existing model(s) */
  destroy(query) { }
  
}
