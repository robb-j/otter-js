
const { collectObjectProperty, getClass } = require('./utils')

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
  
  
  
  /** Creates a new instance of this model */
  static async create(values) {
    
    // TODO: Validate values using our schema
    
    
    // Create record with adapter
    let records = await this.adapter.create(this.name, [values])
    
    
    // Make an instance from the record
    return new this(records[0])
  }
  
  static async createMany(valueSet) {
    
    // TODO: Validate values using our schema
    
    
    // Create records with adapter
    let records = await this.adapter.create(this.name, valueSet)
    
    
    // Make an instance from each record
    return records.map(record => {
      return new this(record)
    })
  }
  
  /** Perform a query for models of this type */
  static async find(query = {}) {
    
    let matches = await this.adapter.find(this.name, query)
    
    return matches.map(record => {
      return new this(record)
    })
  }
  
  /** Performs a query for the first model of this type that matches a query */
  static async findOne(query = {}) {
    query.limit = 1
    let result = await this.adapter.find(this.name, query)
    return result.length > 0 ? result[0] : null
  }
  
  /** Deletes models that match a query */
  static async destroy(query) {
    // Make sure empty query is not passed?
    // await this.adapter.destroy(this.name, query)
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
  
  
  
  /** Saves this model to the store */
  async save() {
    
    let adapter = this.constructor.adapter
    
    // Validate our values using our attributes
    // Warn on unused valies
    //
    // if (this.id) {
    //   await adapter.update(this.id, this.values)
    // }
    // else {
    //   await adapter.create(this.values)
    // }
  }
  
  /** Destroys this model */
  async destroy() {
    // if (this.id) {
    //   await this.constructor.adapter.destroy(this.id)
    // }
  }
  
  
  /** Check these values are allowed to be stored on a model */
  static validateValues(values) {
    
    // Fail if isActive == false
    
    // Find (Ignore?) values which aren't attributes
    
    // Loop attributes
    //  - Use the Attribute to validate the value
  }
  
  
  
}


// Setup class variables
Model._adapter = null
Model._schema = null


// Return our class
module.exports = Model
