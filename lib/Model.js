
const { collectObjectProperty } = require('./utils')



class Model {
  
  /** Gets the adapter asigned to this class to do database queries */
  static get adapter() { return this._adapter }
  
  /** Gets the schema of the model, built when Otter starts */
  static get schema() { return this._schema }
  
  /** Whether this model has been activated and is ready for queries */
  static get isActive() {
    return this.adapter !== null && this._schema !== null
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
