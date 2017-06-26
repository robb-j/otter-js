const Adapter = require('../Adapter')

module.exports = class MemoryAdapter extends Adapter {
  
  setup() {
    this.store = {}
  }
  
  teardown() {
    this.store = null
  }
  
  
  
  find(query) { }
  
  create(modelName, values) { }
  
  update(query) { }
  
  delete(query) { }
}
