const Adapter = require('../Adapter')
const OtterError = require('../errors/OtterError')
const processors = require('./processors/memory')
const { getUsingDot } = require('../utils')


/** An Otter Adapter that creates & connects to an in-memory store, should only be used for testing! */
class MemoryAdapter extends Adapter {
  
  /** @return {Object} The internal store where models are put */
  get store() { return this._store }
  
  /** @return {Object} A map how many of each type are allocated, used for setting ids */
  get counters() { return this._counters }
  
  
  
  async setup(Otter) {
    
    // Add default processors
    for (let name in processors) {
      this.addProcessor(name, processors[name], false)
    }
    
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
  
  baseAttributes() {
    return {
      id: { type: String, default: null },
      createdAt: Date,
      updatedAt: Date
    }
  }
  
  
  
  async create(modelName, allValues) {
    
    // Values should be passed as an array, so multiple can be created at once
    
    // Check the type exists
    this.checkModelName(modelName)
    
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
      record.id = `${id}`
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
  
  async find(modelName, rawQuery, options) {
    
    // Check the type exists
    this.checkModelName(modelName)
    
    // Generate a query
    let query = this.makeQuery(modelName, rawQuery, options)
    
    // Validate the query
    this.validateModelQuery(query)
    
    // Process query ...
    return this.processQuery(query)
  }
  
  async update(modelName, rawQuery, values, options) {
    
    // Check the type exists
    this.checkModelName(modelName)
    
    // Generate a query
    let query = this.makeQuery(modelName, rawQuery, options)
    
    // Validate the query
    this.validateModelQuery(query)
    
    // Validate values
    this.validateModelValues(modelName, values)
    
    // Add the updated date to the things to update
    values.updatedAt = new Date()
    
    // Get matches
    let matches = this.processQuery(query)
    
    // Loop through the matches
    for (let i in matches) {
      
      // Assign the values into the record
      Object.assign(matches[i], values)
    }
    
    // Update matches
    return matches.length
  }
  
  async destroy(modelName, rawQuery, options) {
    
    // Check the type exists
    this.checkModelName(modelName)
    
    // Generate a query
    let query = this.makeQuery(modelName, rawQuery, options)
    
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
  
  async count(modelName, rawQuery, options) {
    
    // Check the type exists
    this.checkModelName(modelName)
    
    // Generate a query
    let query = this.makeQuery(modelName, rawQuery, options)
    
    // Validate the query
    this.validateModelQuery(query)
    
    // Process the query & return the length
    return this.processQuery(query).length
  }
  
  
  
  processQuery(query) {
    
    let allRecords = this.store[query.modelName]
    
    
    // IDEA: Could perform quicker id-based comparisons first?
    
    
    // Loop each record of that model and compare it
    let found = []
    for (var id in allRecords) {
      let record = allRecords[id]
      
      
      // Evaluate this record against the query
      if (this.evaluateRecord(record, query)) {
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
  
  evaluateRecord(record, query) {
    
    for (let attrKey in query.processed) {
      let expr = query.processed[attrKey]
      let value = getUsingDot(attrKey, record)
      
      if (!this.evaluateExpr(expr, value)) {
        return false
      }
    }
    return true
  }
  
  evaluateExpr(fullExpr, value) {
    
    let exprProc = this.processors[fullExpr.type]
    
    if (!exprProc) {
      throw OtterError.fromCode('adapter.unsupportedExpr', 'MemoryAdapter', fullExpr.type)
    }
    
    return exprProc(fullExpr.expr, value)
  }
  
}

module.exports = MemoryAdapter
