const Adapter = require('../Adapter')
const Query = require('../Query')
const processors = require('./processors/mongo')

const MongoClient = require('mongodb').MongoClient
const { promisify } = require('util')

/** An Otter Adapter to connects to & queries a mongo database */
class MongoAdapter extends Adapter {
  
  /** @return {mongo} The mongo db reference */
  get db() { return this._db }
  
  
  constructor(options = {}) {
    super(options)
    
    if (!options.url) {
      throw new Error(`MongoAdapter: requires a 'url' to connect to a mongodb`)
    }
    
    this._db = null
  }
  
  
  async setup(Otter) {
    
    let connect = promisify(MongoClient.connect)
    
    // IDEA: Potential configurations:
    // http://mongodb.github.io/node-mongodb-native/2.2/reference/connecting/connection-settings/
    
    // Connect to mongo
    this._db = await connect(this.options.url, {
      poolSize: this.options.poolSize || 5
    })
    
    // Add default processors
    for (let procName in processors) {
      if (!this.processors[procName]) {
        this.processors[procName] = processors[procName].bind(this)
      }
    }
  }
  
  
  // TODO: This (v)
  supportsAttribute(attribute) { return true }
  
  
  
  
  /**
   * Unpacks a mongo record for ORM use
   * @param  {object} record The record to unpack
   */
  unpackRecord(record) {
    record.id = record._id
    record.createdAt = record._createdAt
    record.updatedAt = record._updatedAt
    
    delete record._id
    delete record._createdAt
    delete record._updatedAt
  }
  
  /**
   * Packs a orm record to be send to mongo
   * @param  {object} record The record to pack
   */
  packRecord(record) {
    record._id = record.id
    record._createdAt = record.createdAt
    record._updatedAt = record.updatedAt
    
    delete record.id
    delete record.createdAt
    delete record.updatedAt
  }
  
  /**
   * Prepares a set of values to be inserted into mongo
   * @param  {[type]} values [description]
   * @return {[type]}        [description]
   */
  prepareValuesForCreate(values) {
    return Object.assign({
      _createdAt: new Date(),
      _updatedAt: new Date()
    }, values)
  }
  
  /**
   * Common guards before performing a query
   * @param  {string} modelName The model being queried
   */
  guardQuery(modelName) {
    
    // Fail if not connected to a mongo instance
    if (!this.db) {
      throw new Error(`MongoAdapter: Cannot query until setup using Otter.start()`)
    }
    
    // Check the type exists
    this.checkModelName(modelName)
  }
  
  
  
  
  
  async create(modelName, allValues) {
    
    // Perform Guards
    this.guardQuery(modelName)
    
    
    // Check values are allowed & add timestamps
    allValues = allValues.map(values => {
      this.validateModelValues(modelName, values)
      return this.prepareValuesForCreate(values)
    })
    
    
    // Get the db collection for the model
    let collection = this.db.collection(modelName)
    
    
    // Execute the query
    let result = await collection.insertMany(allValues)
    
    
    // Process & return the records
    let newRecords = result.ops
    newRecords.forEach(this.unpackRecord.bind(this))
    return newRecords
  }
  
  async find(modelName, rawQuery, options) {
    
    // Perform Guards
    this.guardQuery(modelName)
    
    // Generate a query
    let query = this.makeQuery(modelName, rawQuery, options)
    
    // Validate the query
    this.validateModelQuery(query)
    
    
    let collection = this.db.collection(modelName)
    let op = collection.find(this.genMongoQuery(query))
    
    // TODO: Sorts
    // TODO: Pluck
    
    
    // Apply limits
    if (typeof query.limit === 'number') {
      op.limit(query.limit)
    }
    
    
    // Execute the operation
    let result = await op.toArray()
    
    
    // Process records
    result.forEach(this.unpackRecord.bind(this))
    
    return result
  }
  
  async update(modelName, rawQuery, values) {
    return []
  }
  
  async destroy(modelName, rawQuery) {
    return 0
  }
  
  
  
  
  genMongoQuery(query) {
    
    // Loop through processed
    // - Get expr processor
    // - Use processor to generate query
    
    let mq = {}
    let schema = this.models[query.modelName].schema
    
    for (let attrName in query.processed) {
      Object.assign(mq, this.evaluateExpr(schema[attrName], query.processed[attrName]))
    }
    
    return mq
  }
  
  evaluateExpr(attr, fullExpr) {
    
    let exprProc = this.processors[fullExpr.type]
    
    if (!exprProc) {
      throw new Error(`MongoAdapter: Unsupported expression ${fullExpr.type}`)
    }
    
    return exprProc(attr, fullExpr.expr)
  }
  
}


module.exports = MongoAdapter
