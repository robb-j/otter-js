const Adapter = require('../Adapter')
const { flattenObject } = require('../utils')

module.exports = class MemoryAdapter extends Adapter {
  
  get store() { return this._store }
  get counters() { return this._counters }
  
  async setup(Otter) {
    
    this._store = {}
    this._counters = {}
    
    for (let name in this.models) {
      this._store[name] = {}
      this._counters[name] = 0
    }
  }
  
  async teardown(Otter) {
    this._store = null
  }
  
  
  supportsAttribute(attribute) { return true }
  
  
  
  async create(modelName, allValues) {
    
    // Values should be passed as an array, so multiple can be created at once
    
    // IDEA: A middle function on Adapter to process values -> Model
    
    // Values should have already been validated by Model
    
    
    // Check the type exists
    if (!this.models[modelName]) {
      throw new Error(`Cannot create unknown Model '${modelName}'`)
    }
    
    
    // The ids of the newly created objects
    let newIds = []
    
    // Loop the each value to create
    for (let i in allValues) {
      let values = allValues[i]
      
      
      // Generate a unique id
      let id = this.counters[modelName]++
      
      
      // Put the id onto the values
      values.id = id
      
      
      // Flatten nested values
      values = flattenObject(values)
      
      
      // Store values in our store
      this.store[modelName][id] = values
      
      
      // Return the id of the new record
      newIds.push(id)
    }
    
    // Return the new ids
    return newIds
  }
  
  async find(query) { }
  
  async update(query) { }
  
  async delete(query) { }
  
}
