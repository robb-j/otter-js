const { collectObjectProperty, getClass, undefOrNull } = require('./utils')

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
  
  
  
  /** Creates a new instance of this model */
  static async create(values) {
    
    // Delegate to createMany
    return (await this.createMany([values]))[0]
  }
  
  /** Creates multiple instances of this model */
  static async createMany(valueSet) {
    
    // TODO: Validate values using our schema
    
    
    // Create records with adapter
    let records = await this.adapter.create(this.name, valueSet)
    
    
    // Make an instance from each record
    return records.map(record => {
      return new this(record)
    })
  }
  
  /** Perform a query for models that match a query */
  static async find(query = {}) {
    
    let matches = await this.adapter.find(this.name, query)
    
    return matches.map(record => {
      return new this(record)
    })
  }
  
  /** Performs a query for the first model that matches or null */
  static async findOne(query = {}) {
    let q = this.adapter.makeQuery(this.name, query)
    q.limit = 1
    let result = await this.adapter.find(this.name, q)
    return result.length > 0 ? result[0] : null
  }
  
  /** Deletes models that match a query */
  static async destroy(query) {
    
    // IDEA: Make sure empty query is not passed?
    return this.adapter.destroy(this.name, query)
  }
  
  /** Updates records that match a query */
  static async update(query, values) {
    
    return this.adapter.update(this.name, query, values)
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
    
    // TODO: Validate our values using our attributes
    
    
    // If not created yet, create a new record
    if (undefOrNull(this.id)) {
      let records = await this.adapter.create(this.modelName, [this.values])
      this.values = records[0]
    }
    else {
      
      // If already created, update the record
      let records = await this.adapter.update(this.modelName, this.id, this.values)
      
      if (records.length === 0) {
        throw new Error(`${this.modelName}: Cannot update model '${this.id}' that doesn't exist `)
      }
      
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
  
  
  /** Check these values are allowed to be stored on a model */
  static validateValues(values) {
    
    // Fail if isActive == false
    
    // Find (Ignore?) values which aren't attributes
    
    // Loop attributes
    //  - Use the Attribute to validate the value
  }
  
  
  
  
  
  // Lifecycle Hooks
  
  /** Called before a model is validated and saved */
  willBeSaved() {}
  
  /** Called after a model was saved */
  wasSaved() {}
  
  /** Called before a model is destroyed */
  willBeDestroyed() {}
  
  /** Called after a model is destroyed */
  wasDestroyed() {}
  
  /* istanbul ignore next */
  /** Whether this model can be destroyed or not */
  canBeDestroyed() { return true }
  
  /* istanbul ignore next */
  /** Whether this model can be saved or not */
  isValid() { return true }
  
  
  
  
  // Customisation
  inspect() { return this.values }
  toJSON() { return this.values }
}


// Setup class variables
Model._adapter = null
Model._schema = null


// Return our class
module.exports = Model
