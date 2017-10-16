const { collectObjectProperty, getClass, undefOrNull, isEmptyObject } = require('./utils')
const QueryPromise = require('./promises/QueryPromise')

/**
 * The definition of an object that can be stored in the database
 * Define the fields in your database by adding attributes to your Model
 * Specify how the data will be stored by linking to an adapter
 * @type {Otter.Types.Model}
 */
class Model {
  
  /** Gets the adapter asigned to this class to do database queries */
  static get adapter() { return this._adapter }
  
  /** Gets the schema of the model, built when Otter starts */
  static get schema() { return this._schema }
  
  /** Whether this model has been activated and is ready for queries */
  static get isActive() {
    return this._adapter !== null && this._schema !== null
  }
  
  
  
  /** Override point for subclass to use different adapters */
  static adapterName() { return 'default' }
  
  /** Override point for subclasses to add attributes, no need to call super */
  static attributes() {
    return { id: String, createdAt: Date, updatedAt: Date }
  }
  
  /** Collects all attributes by traversing the inheritence tree */
  static collectAttributes() {
    return collectObjectProperty(this, 'attributes')
  }
  
  
  
  /** Creates a new instance (or array of) of this model */
  static async create(values) {
    
    // TODO: Error if not setup?
    
    // If not passed an array, make one and remember
    let passedAnArray = Array.isArray(values)
    if (!passedAnArray) { values = [values] }
    
    // Create the records using our adapter
    let records = await this.adapter.create(this.name, values)
    
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
      return matches.map(r => new this(r))
    })
  }
  
  /** Performs a query for the first model that matches or null */
  static findOne(rawQuery = {}, options = {}) {
    
    return this._chainableQuery(rawQuery, options, async (query) => {
      query.limit = 1
      let matches = await this.adapter.find(this.name, query)
      return (matches.length > 0 && new this(matches[0])) || null
    })
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
        throw new Error(`Destroy Guard - Specify 'all' to destroy all records`)
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
        throw new Error(`Update Guard - Specify 'all' to update all records`)
      }
      return this.adapter.update(this.name, query, values, options)
    })
  }
  
  
  
  
  static _chainableQuery(rawQuery, options, callback) {
    
    let query = this.adapter.makeQuery(this.name, rawQuery, options)
    return QueryPromise.makeThenTick(query, async (resolve, reject) => {
      try {
        let value = await callback(query)
        resolve(value)
      }
      catch (error) {
        reject(error)
      }
    })
  }
  
  
  
  /** Creates a new instance of this model */
  constructor(values = {}) {
    
    // Store the values for attributes to access
    this.values = values
    // Object.defineProperty(this, 'values', { value: values })
    
    // Use our attributes to install getters & setters
    for (let name in this.schema) {
      this.schema[name].installOn(this)
    }
  }
  
  
  
  /** Gets the adapter used to connect this model to the database */
  get adapter() { return getClass(this).adapter }
  
  /** Gets the schema defining the structure of this model */
  get schema() { return getClass(this).schema }
  
  /** Gets the name of this model */
  get modelName() { return getClass(this).name }
  
  /** Whether this model is stored in the database */
  get exists() { return undefOrNull(this.id) === false }
  
  
  
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
        throw new Error(`${this.modelName}: Cannot update model '${this.id}' that doesn't exist `)
      }
      
      // Update our record
      this.values = records[0]
    }
  }
  
  /** Destroys this model */
  async destroy() {
    
    // Fail if not created yet
    if (undefOrNull(this.id)) {
      throw new Error(`${this.modelName}: Cannot destroy model that hasn't ben created`)
    }
    else {
      
      // Try to delete ourself
      let numDeleted = await this.constructor.adapter.destroy(this.modelName, this.id)
      
      // If no records were deleted, throw an error
      if (numDeleted === 0) {
        throw new Error(`${this.modelName}: Cannot destroy model '${this.id}' that doesn't exist`)
      }
    }
  }
  
  
  
  
  /** Subclass hook to validate values before they are saved */
  static validateValues(values) {
    // Subclasses can override
  }
  
  /** Subclass hook to perform logic on values about to be inserted */
  static processValues(values) {
    // Override in your subclasses
  }
  
  
  
  
  // Customisation
  inspect() { return this.values }
  toJSON() { return this.values }
}


// Setup class variables
Model._adapter = null
Model._schema = null


// Return our class
module.exports = Model
