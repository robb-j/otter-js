const Adapter = require('../Adapter')
const Query = require('../Query')
const processors = require('./processors/mongo')

const MongoClient = require('mongodb').MongoClient
const { promisify } = require('util')

/** An Otter Adapter to connects to & queries a mongo database */
class MongoAdapter extends Adapter {
  
  /** @return {MongoClient} The client connecting to mongo */
  get client() { return this._client }
  
  /** @return {mongo} The mongo db reference */
  get db() { return this._db }
  
  
  constructor(options) {
    super(options)
    
    if (!options.url) {
      throw new Error(`MongoAdapter: requires a 'url' to connect to a mongodb`)
    }
    
    let poolSize = options.poolSize || 5
    
    this._client = null
    this._db = null
  }
  
  
  async setup(Otter) {
    
    let connect = promisify(MongoClient.connect)
    
    // IDEA: Potential configurations:
    // http://mongodb.github.io/node-mongodb-native/2.2/reference/connecting/connection-settings/
    
    console.log(this.options.url)
    
    // Connect to mongo
    this._db = await connect(this.options.url, {
      poolSize: this.options.poolSize || 5
    })
  }
  
  
  // TODO: This (v)
  supportsAttribute(attribute) { return true }
  
  
  
  
  
  prepareRecord(record) {
    
    record.id = record._id
    record.createdAt = record._createdAt
    record.updatedAt = record._updatedAt
    
    delete record._id
    delete record._createdAt
    delete record._updatedAt
  }
  
  
  
  
  async create(modelName, allValues) {
    
    // Check the type exists
    this.checkModelName(modelName)
    
    
    // Check values are allowed & add timestamps
    allValues = allValues.map(values => {
      this.validateModelValues(modelName, values)
      // values._createdAt = new Date()
      // values._updatedAt = new Date()
      return Object.assign({
        _createdAt: new Date(),
        _updatedAt: new Date()
      }, values)
    })
    
    if (!this.db) {
      throw new Error(`MongoAdapter: Cannot query until setup using Otter.start()`)
    }
    
    
    // IDEA: format modelName?
    
    
    // Get the db collection for the model
    let collection = this.db.collection(modelName)
    
    
    // Execute the query
    let result = await new Promise((resolve, reject) => {
      collection.insertMany(allValues, function(err, result) {
        if (err) reject(err)
        else resolve(result)
      })
    })
    
    
    // Process & return the records
    let newRecords = result.ops
    newRecords.forEach(this.prepareRecord.bind(this))
    return newRecords
  }
  
  async find(modelName, rawQuery) {
    
    // Check the type exists
    this.checkModelName(modelName)
    
    // Generate a query
    let query = this.makeQuery(modelName, rawQuery)
    
    // Validate the query
    this.validateModelQuery(query)
    
    // Process the query
    let mongoQuery = this.generateMongoQuery(query)
    
    // Execute the query
    let collection = this.db.collection(modelName)
    let result = await new Promise((resolve, reject) => {
      collection.find(mongoQuery).toArray(function(err, docs) {
        if (err) reject(err)
        else resolve(docs)
      })
    })
    
    // Process records
    result.forEach(this.prepareRecord.bind(this))
    
    return result
  }
  
  async update(modelName, rawQuery, values) {
    return []
  }
  
  async destroy(modelName, rawQuery) {
    return 0
  }
  
  
  
  
  generateMongoQuery(query) {
    
    // Loop through processed
    // - Get expr processor
    // - Use processor to generate query
    
    return {}
  }
  
}


module.exports = MongoAdapter