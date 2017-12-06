const { makePluginable } = require('./utils')
const Query = require('./Query')
const OtterError = require('./errors/OtterError')


/**
 * A connection to a database, providing methods to query, create, update & destroy records.
 * Subclass to support different database or support new attributes on existing Adapters
 * @type {Otter.Types.Adapter}
 */
class Adapter {
  
  /**
   * The name of the adapter
   * @type {String}
   */
  get name() { return this._name }
  
  /**
   * The configuration passed to the adapter, e.g. database connection details
   * @type {Object}
   */
  get options() { return this._options }
  
  /**
   * The models that have been registered on this adapter
   * @type {Otter.Types.Model[]}
   */
  get models() { return this._models }
  
  /**
   * Custom code used convert our queries into database queries
   * @type {Otter.Types.ExprProcessor}
   */
  get processors() { return this._processors }
  
  
  
  /**
   * Creates a new Adapter
   * @param  {Object} [options={}] Configuration for the adapter
   */
  constructor(options) {
    options = options || {}
    this._name = options.name || 'default'
    this._options = options
    this._models = {}
    this._processors = {}
    
    makePluginable(this)
  }
  
  /**
   * Called when an adapter needs to be setup, e.g. used to connect to its database
   * @param  {Otter} Otter The instance of otter the adapter was added to
   * @return {Promise}
   */
  async setup(Otter) { }
  
  /**
   * Called when an adapter needs to be removed, e.g. used to disconnect to its database
   * @param  {Otter} Otter The instance of otter the adapter was added to
   * @return {Promise}
   */
  async teardown(Otter) { }
  
  
  
  /**
   * Adds a processor to the adapter
   * @param {String} type The part of the query the adapter is responsible for, e.g. 'where' or 'sort'
   * @param {Otter.Types.QueryProcessor} processor The processor to add, a function which takes (key, value, attribute)
   */
  addProcessor(type, processor) {
    
    // Fail if not a function or incorrect arguements
    if (typeof processor !== 'function') {
      throw OtterError.fromCode('adapter.invalidProcessor')
    }
    
    // If a list isn't already created for that type, create one
    if (!this.processors[type]) this.processors[type] = []
    
    // Add the processor to the start of the list
    this.processors[type].unshift(processor)
    
    // Return ourself for chaining
    return this
  }
  
  
  
  /**
   * The base attributes that Models installed on this adapter recieve, defaults to none
   * @return {object} Key-valued attributes
   */
  baseAttributes() {
    return {}
  }
  
  
  
  /**
   * Whether this Adapter supports a type of Attribute
   * @param  {Strign} attribute The classname of the Otter.Types.Attribute being queried
   * @return {Boolean}
   */
  supportsAttribute(attribute) { return false }
  
  
  
  /**
   * Creates a query from a modelName and raw query object.
   * It will just return an Otter.Types.Query if passed one
   * @param  {String} modelName The name of the model being queried
   * @param  {any|Otter.Types.Query} query The raw query to create a query for
   * @return {Otter.Types.Query}
   */
  makeQuery(modelName, query, options) {
    if (!this.models[modelName] || !this.models[modelName].schema) {
      throw OtterError.fromCode('adapter.unknownModel', modelName)
    }
    return query instanceof Query ? query : new Query(this.models[modelName], query, options)
  }
  
  /** Validates if a query can be executed on a model */
  validateModelQuery(query) {
    
    // Fail if we don't recognise the model
    let Model = this.models[query.modelName]
    if (!Model) {
      throw OtterError.fromCode('adapter.unknownModel', query.modelName)
    }
    
    query.prepareForSchema(Model.schema)
  }
  
  /** Validate if values can be set onto a model */
  validateModelValues(modelName, values) {
    
    // Make sure we were actually passed values
    if (typeof values !== 'object') {
      throw OtterError.fromCode('adapter.missingValues')
    }
    
    
    // Fail if we don't recognise the model
    let Model = this.models[modelName]
    if (!Model) {
      throw OtterError.fromCode('adapter.unknownModel', modelName)
    }
    
    
    // Check for values which don't map to the model's attributes
    let knownAttrs = Object.keys(Model.schema)
    let unknownAttrs = Object.keys(values).filter((attrName) => {
      return !knownAttrs.includes(attrName)
    })
    
    
    // Fail if there are unknown attributes
    if (unknownAttrs.length > 0) {
      let mapped = unknownAttrs.map((val) => { return `${modelName}.${val}` }).join(', ')
      throw OtterError.fromCode('adapter.unknownAttrs', mapped)
    }
    
    
    // Check the values against the model's schema
    Model.validateValuesAgainstSchema(values)
    
    
    // Let the model validate itself (for subclass hooks)
    Model.validateValues(values)
  }
  
  /** Checks if a model is installed on this Adapter */
  checkModelName(modelName) {
    if (!this.models[modelName]) {
      throw OtterError.fromCode('adapter.unknownModel', modelName)
    }
  }
  
  
  
  /**
   * Performs a query for objects that match a query
   * @param  {String} modelName The name of the model to query records from
   * @param  {any|Otter.Types.Query} rawQuery The query to execute
   * @param  {object} options The options for the query
   * @return {Object[]} The raw matched records
   */
  async find(modelName, rawQuery, options) { }
  
  /**
   * Creates a set of models with the given values
   * @param  {String} modelName The name of the model to create records of
   * @param  {Object[]} allValues The values to create records with
   * @return {Object[]} The raw new records
   */
  async create(modelName, allValues) { }
  
  /**
   * Updates records that match a query
   * @param  {String} modelName The name of the model to update records of
   * @param  {any|Otter.Types.Query} rawQuery The query of which records to update
   * @param  {Object} values The values to update on each matched record
   * @param  {object} options The options for the query
   * @return {Object} The raw updated records
   */
  async update(modelName, rawQuery, values, options) { }
  
  /**
   * Destroys records that match a query
   * @param  {String} modelName The name of the model to destroy records from
   * @param  {any|Otter.Types.Query} rawQuery The query of which records to destroy
   * @param  {object} options The options for the query
   * @return {Integer} The number of records destroyed
   */
  async destroy(modelName, rawQuery, options) { }
  
}


Adapter._models = {}


module.exports = Adapter
 
