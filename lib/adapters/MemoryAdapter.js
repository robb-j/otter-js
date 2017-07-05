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

/** An adapter that creates an in-memory store, should only be used for testing! */
class MemoryAdapter extends Adapter {
  
  /** @return {Object} The internal store where models are put */
  get store() { return this._store }
  
  /** @return {Object} A map how many of each type are allocated, used for setting ids */
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
  
  
  
  async create(modelName, allValues = []) {
    
    // Values should be passed as an array, so multiple can be created at once
    
    
    // Check values are allowed
    allValues.forEach(values => {
      this.validateModelValues(modelName, values)
    })
    
    
    // The ids of the newly created objects
    let newRecords = []
    
    // Loop the each value to create
    for (let i in allValues) {
      
      // Generate a unique id
      let id = ++this.counters[modelName]
      
      
      // Make a copy of the attribute
      let record = Object.assign({}, allValues[i])
      
      
      // Put metadata onto record
      record.id = id
      record.createdAt = new Date()
      record.updatedAt = new Date()
      
      
      // Store values in our store
      this.store[modelName][id] = record
      
      
      // Add the record to be returned
      newRecords.push(record)
    }
    
    // Return the new ids
    return newRecords
  }
  
  async find(modelName, rawQuery) {
    
    // Check the type exists
    this.checkModelName(modelName)
    
    
    // Generate a query
    let query = this.makeQuery(modelName, rawQuery)
    
    
    // Validate the query
    this.validateModelQuery(query)
    
    
    // Process query ...
    return this.processQuery(query)
  }
  
  async update(modelName, rawQuery, values) {
    
    // Check the type exists
    this.checkModelName(modelName)
    
    
    // Generate a query
    let query = this.makeQuery(modelName, rawQuery)
    
    
    // Validate the query
    this.validateModelQuery(query)
    
    
    // Validate values
    this.validateModelValues(modelName, values)
    
    
    // Get matches
    let matches = this.processQuery(query)
    
    // Loop through the matches
    for (let i in matches) {
      
      // Assign the values into the record
      Object.assign(matches[i], values)
    }
    
    // Update matches
    return matches
  }
  
  async destroy(modelName, rawQuery) {
    
    // Check the type exists
    this.checkModelName(modelName)
    
    
    // Generate a query
    let query = this.makeQuery(modelName, rawQuery)
    
    
    // Validate the query
    this.validateModelQuery(query)
    
    
    // Get values to destroy
    let matches = this.processQuery(query)
    
    
    // Delete them from our store
    matches.forEach(record => {
      delete this.store[modelName][record.id]
    })
    
    
    // Return the number of records deleted
    return matches.length
  }
  
  
  
  processQuery(query) {
    
    let allRecords = this.store[query.modelName]
    
    
    // IDEA: Could perform quicker id-based comparisons first?
    
    // Loop each record of that model and compare it
    let found = []
    for (var id in allRecords) {
      let record = allRecords[id]
      
      // Attempt to match the record
      if (this.matchRecord(record, query.where)) {
        found.push(record)
      }
      
      // If a limit is set, don't find more records than needed
      if (query.limit !== null && found.length >= query.limit) {
        break
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

module.exports = MemoryAdapter
