
const { collectObjectProperty } = require('./utils')



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
    
    // Validate values using our schema
    // // ...
    // await this.adapter.create(this.name, values)
  }
  
  /** Perform a query for models of this type */
  static async find(query = {}) {
    // query.model = this.name
    // this.adapter.find(query)
  }
  
  /** Performs a query for the first model of this type that matches a query */
  static async findOne(query = {}) {
    // query.model = this.name
    // query.limit = 1
    // await this.adapter.find(this.name, query)
  }
  
  /** Deletes models that match a query */
  static async destroy(query) {
    // query.model = this.name
    // await this.adapter.destroy(query)
  }
  
  
  
  /** Creates a new instance of this model */
  constructor(values) {
    values = values || {}
    this.id = null
    
    // Validate values using attributes
    // Use attributes to install values
    // Warn on values not used
  }
  
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
