const { makePluginable, getClass, undefOrNull } = require('./utils')
const Query = require('./Query')


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
   * @type {Otter.Types.QueryProcessor}
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
    this._processors = {
      where: [], sort: [], create: [], limit: [], pluck: []
    }
    
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
      throw new Error('Invalid Processor: Should be a function')
    }
    
    // If a list isn't already created for that type, create one
    if (!this.processors[type]) this.processors[type] = []
    
    // Add the processor to the start of the list
    this.processors[type].unshift(processor)
    
    // Return ourself for chaining
    return this
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
  makeQuery(modelName, query) {
    
    if (typeof query === 'object' && getClass(query).name === 'Query') {
      return query
    }
    return new Query(modelName, query)
  }
  
  /** Validates if a query can be executed on a model */
  validateModelQuery(query) {
    
    // Fail if we don't recognise the model
    let Model = this.models[query.modelName]
    if (!Model) {
      throw new Error(`Cannot query unknown Model: '${query.modelName}'`)
    }
    
    // Process where clause
    for (let attrName in query.where) {
      
      let attribute = Model.schema[attrName]
      
      // Fail if attribute doesn't exist
      if (!attribute) {
        throw new Error(`Cannot query unknown Attribute: '${query.modelName}.${attrName}'`)
      }
      
      // Let the attribute validate the value
      attribute.validateQueryValue(query.where[attrName])
    }
    
    
    // Process sort clause
    // ...
    
    // Process limit clause
    // ...
    
    // Process pluck clause
    // ...
    
    // ...
  }
  
  /** Validate if values can be set onto a model */
  validateModelValues(modelName, values) {
    
    // Make sure we were actually passed values
    if (typeof values !== 'object') {
      throw new Error(`Cannot create/update without values`)
    }
    
    
    // Fail if we don't recognise the model
    let Model = this.models[modelName]
    if (!Model) {
      throw new Error(`Cannot create/update unknown Model: '${modelName}'`)
    }
    
    
    // Check for values which don't map to the model's attributes
    let knownAttrs = Object.keys(Model.schema)
    let unknownAttrs = Object.keys(values).filter((attrName) => {
      return !knownAttrs.includes(attrName)
    })
    
    
    // Fail if there are unknown attributes
    if (unknownAttrs.length > 0) {
      let mapped = unknownAttrs.map((val) => { return `${modelName}.${val}` }).join(', ')
      throw new Error(`Cannot create/update with unknown Attributes: ${mapped}`)
    }
    
    
    // Let each attribute validate its value
    for (let attrName in Model.schema) {
      Model.schema[attrName].validateModelValue(values[attrName])
    }
    
  }
  
  
  
  /**
   * Performs a query for objects that match a query
   * @param  {String} modelName The name of the model to query records from
   * @param  {any|Otter.Types.Query} query The query to execute
   * @return {Object[]} The raw matched records
   */
  find(modelName, query) { }
  
  /**
   * Creates a set of models with the given values
   * @param  {String} modelName The name of the model to create records of
   * @param  {Object[]} values The values to create records with
   * @return {Object[]} The raw new records
   */
  create(modelName, values) { }
  
  /**
   * Updates records that match a query
   * @param  {String} modelName The name of the model to update records of
   * @param  {any|Otter.Types.Query} query The query of which records to update
   * @param  {Object} values The values to update on each matched record
   * @return {Object} The raw updated records
   */
  update(modelName, query, values) { }
  
  /**
   * Destroys records that match a query
   * @param  {String} modelName The name of the model to destroy records from
   * @param  {any|Otter.Types.Query} query The query of which records to destroy
   * @return {Integer} The number of records destroyed
   */
  destroy(modelName, query) { }
  
}


Adapter._models = {}


module.exports = Adapter
