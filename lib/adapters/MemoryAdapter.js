const Adapter = require('../Adapter')

module.exports = class MemoryAdapter extends Adapter {
  
  async setup() {
    this.store = {}
  }
  
  async teardown() {
    this.store = null
  }
  
  
  supportsAttribute(attribute) { return true }
  
  
  
  find(query) { }
  
  create(modelName, values) { }
  
  update(query) { }
  
  delete(query) { }
}
