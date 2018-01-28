const Cluster = require('./Cluster')
const { undefOrNull, isEmptyObject, getClass } = require('./utils')
const QueryPromise = require('./promises/QueryPromise')
const OtterError = require('./errors/OtterError')


OtterError.registerTypes('model', {
  destroyGuard: (modelName) => `${modelName} *Destroy Guard* Specify 'all' to destroy all records`,
  updateGuard: (modelName) => `${modelName} *Update Guard* Specify 'all' to update all records`,
  saveFailed: (model) => `${model.modelName}: Cannot save model '${model.id}' that doesn't exist`,
  cannotDestroy: (model) => `${model.modelName} - Cannot destroy model that hasn't ben created`,
  destroyFailed: (model) => `${model.modelName} - Cannot destroy model '${model.id}' that doesn't exist`
})


/**
 * The definition of an object that can be stored in the database
 * Define the fields in your database by adding attributes to your Model
 * Specify how the data will be stored by linking to an adapter
 * @type {Otter.Types.Model}
 */
class Model extends Cluster {
  
  /**
   * Collects all attributes by traversing the inheritence tree
   * @param  {Otter.Types.Adapter} adapter The adapter being installed on
   * @return {object} The key-valued attributes representing this model
   */
  static collectAttributes(adapter) {
    return Object.assign(adapter.baseAttributes(), super.collectAttributes(adapter))
  }
  
  
  
  /** Gets the name of this model */
  get modelName() { return getClass(this).name }
  
  /** Whether this model is stored in the database */
  get exists() { return undefOrNull(this.id) === false }
  
  
  
  /** Creates a new instance (or array of) of this model */
  static async create(values) {
    
    // TODO: Error if not setup?
    
    // If not passed an array, make one and remember
    let passedAnArray = Array.isArray(values)
    if (!passedAnArray) { values = [values] }
    
    // Create models from to prepare the values (using attribute#installOn)
    let preparedValues = values.map(record => (new this(record)).values)
    
    // Create the records using our adapter
    let records = await this.adapter.create(this.name, preparedValues)
    
    // Map records to instances of ourself
    let models = records.map(record => {
      return new this(record)
    })
    
    // Return the models, or a single one (if not passed an array)
    return passedAnArray ? models : models[0]
  }
  
  /** Perform a query for models that match a query */
  static find(rawQuery = {}, options = {}) {
    return this._chainableQuery(rawQuery, options, async (query) => {
      let matches = await this.adapter.find(this.name, query)
      let records = matches.map(r => new this(r))
      return query.singular ? records[0] || null : records
    })
  }
  
  /** Performs a query for the first model that matches or null */
  static findOne(rawQuery = {}, options = {}) {
    return this.find(rawQuery, options).first()
  }
  
  /** Deletes models that match a query */
  static destroy(rawQuery = {}, options = {}) {
    
    let allowDestroyAll = false
    
    if (rawQuery === 'all') {
      allowDestroyAll = true
      rawQuery = {}
    }
    
    return this._chainableQuery(rawQuery, options, (query) => {
      if (isEmptyObject(query.where) && !allowDestroyAll) {
        throw OtterError.fromCode('model.destroyGuard', this.name)
      }
      return this.adapter.destroy(this.name, query, options)
    })
  }
  
  /** Updates records that match a query */
  static update(rawQuery, values, options = {}) {
    
    let usedWildcard = false
    
    if (rawQuery === 'all') {
      usedWildcard = true
      rawQuery = {}
    }
    
    return this._chainableQuery(rawQuery, options, (query) => {
      if (isEmptyObject(query.where) && !usedWildcard) {
        throw OtterError.fromCode('model.updateGuard', this.name)
      }
      return this.adapter.update(this.name, query, values, options)
    })
  }
  
  
  
  /**
   * (Internal) Makes a chainable QueryPromise for model methods
   * @param  {object}   rawQuery The query to execute
   * @param  {object}   options  Options to pass to the query
   * @param  {Function} callback A callback when the query is ready
   * @return {QueryPromise}      A promise with extra methods to modify the query
   */
  static _chainableQuery(rawQuery, options, callback) {
    
    // Generate the query
    let query = this.adapter.makeQuery(this.name, rawQuery, options)
    
    // Create a new QueryPromise
    return new QueryPromise((resolve, reject) => {
      
      // Wait until the next tick so extra filters can be added
      process.nextTick(async () => {
        try {
          resolve(await callback(query))
        }
        catch (error) {
          reject(error)
        }
      })
      
    }, query)
  }
  
  
  
  /** Saves this model to the store */
  async save() {
    
    // Validate our values using the adapter
    this.adapter.validateModelValues(this.modelName, this.values)
    
    // If not created yet, create a new record
    if (undefOrNull(this.id)) {
      let records = await this.adapter.create(this.modelName, [this.values])
      this.values = records[0]
    }
    else {
      
      // If already created, update the record
      await this.adapter.update(this.modelName, this.id, this.values)
      let records = await this.adapter.find(this.modelName, this.id)
      
      // Throw an error if theres no matching record
      if (records.length === 0) {
        throw OtterError.fromCode('model.saveFailed', this)
      }
      
      // Update our record
      this.values = records[0]
    }
  }
  
  /** Destroys this model */
  async destroy() {
    
    // Fail if not created yet
    if (undefOrNull(this.id)) {
      throw OtterError.fromCode('model.cannotDestroy', this)
    }
    else {
      
      // Try to delete ourself
      let numDeleted = await this.constructor.adapter.destroy(this.modelName, this.id)
      
      // If no records were deleted, throw an error
      if (numDeleted === 0) {
        throw OtterError.fromCode('model.destroyFailed', this)
      }
    }
  }
  
  
  
  
}


// Setup class variables
Model._adapter = null
Model._schema = null


module.exports = Model
