const Adapter = require('../Adapter')
const Query = require('../Query')
const { flattenObject } = require('../utils')


// TODO: Refactor to own files w/ module.exports
const comparitors = [
  (key, record, value) => {
    return Array.isArray(value) ? value.includes(record[key]) : false
  },
  (key, record, value) => {
    return record[key] === value
  }
]


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
  
  checkModelName(modelName) {
    if (!this.models[modelName]) {
      throw new Error(`Cannot query unknown Model '${modelName}'`)
    }
  }
  
  
  
  async create(modelName, allValues) {
    
    // Values should be passed as an array, so multiple can be created at once
    
    
    // TODO: Check values are allowed
    // allValues.forEach(values => {
    //   this.validateModelValues(modelName, values)
    // })
    
    
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
  
  async find(modelName, query) {
    
    // Check the type exists
    this.checkModelName(modelName)
    
    
    // TODO: Validate the query
    // this.validateQuery(modelName, query)
    
    
    // Process query ...
    return this.processQuery(new Query(modelName, query))
  }
  
  async update(modelName, query, values) {
    
    // Check the type exists
    this.checkModelName(modelName)
    
    
    // TODO: Validate the query
    // this.validateQuery(modelName, query)
    
    
    // TODO: Validate values w/ model
    // this.validateModelValues(modelName, values)
    
    
    // Get matches
    let matches = this.processQuery(new Query(modelName, query))
    
    // Loop through the matches
    for (let i in matches) {
      
      // Assign the values into the record
      Object.assign(matches[i], values)
    }
    
    // Update matches
    return matches
  }
  
  async destroy(modelName, query) {
    
    // Check the type exists
    this.checkModelName(modelName)
    
    
    // TODO: validate the query
    // this.validateQuery(modelName, query)
    
    
    // Get values to destroy
    let matches = this.processQuery(new Query(modelName, query))
    
    
    // Delete them from our store
    matches.forEach(record => {
      delete this.store[modelName][record.id]
    })
    
    
    // return matches
  }
  
  
  
  processQuery(query) {
    
    let allRecords = this.store[query.modelName]
    
    // If just looking for an id, just do that
    // if (query.where.id && Object.keys(query.where) === 1) {
    //
    //   // If a single value, try to find a single object
    //   if (typeof query.where.id === 'string' || typeof query.where.id === 'number') {
    //     let found = allRecords[query.where.id]
    //     return found ? [found] : []
    //   }
    //
    //   // If an array, try to find multiple
    //   if (Array.isArray(query.where.id)) {
    //     let found = []
    //     query.where.id.forEach(id => {
    //       if (allRecords[id]) found.push(allRecords[id])
    //     })
    //     return found
    //   }
    // }
    
    
    // Otherwise, the query is more complicated
    let found = []
    for (var id in allRecords) {
      let record = allRecords[id]
      
      // Attempt to match the record
      if (this.matchRecord(record, query.where)) {
        found.push(record)
      }
    }
    
    // Return the matches
    return found
    
  }
  
  matchRecord(record, where) {
    
    // Loop through the attributes in the where
    for (let attribute in where) {
      
      // For each one, check it is a match
      if (!this.processComparison(attribute, record, where[attribute])) {
        return false
      }
    }
    
    // If all attributes match, its a match
    return true
  }
  
  processComparison(attribute, record, value) {
    
    // Use each of our comparitors
    for (let i in comparitors) {
      
      // If any of them returns true, its a match
      if (comparitors[i](attribute, record, value)) {
        return true
      }
    }
    
    // If none returned true, its not a match
    return false
  }
  
}
