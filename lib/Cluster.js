const { collectObjectProperty, getClass, undefOrNull } = require('./utils')

/**
 * A set of related values to be stored in a database
 * @type {Otter.Types.Cluster}
 */
class Cluster {
  
  /** Gets the adapter asigned to this class to do database queries */
  static get adapter() { return this._adapter }
  
  /** Gets the schema of the model, built when Otter starts */
  static get schema() { return this._schema }
  
  /** Whether this model has been activated and is ready for queries */
  static get isActive() {
    return !undefOrNull(this.adapter) && !undefOrNull(this.schema)
  }
  
  
  
  /** Override point for subclass to use different adapters */
  static adapterName() { return 'default' }
  
  /** Override point for subclasses to add attributes, no need to call super */
  static attributes() { return {} }
  
  /**
   * Collects all attributes by traversing the inheritence tree
   * @param  {Otter.Types.Adapter} adapter The adapter being installed on
   * @return {object} The key-valued attributes representing this model
   */
  static collectAttributes(adapter) {
    return collectObjectProperty(this, 'attributes')
  }
  
  /**
   * Validate the schema of this Cluster
   * @param  {Otter} Otter  The instance the model installed on
   */
  static validateSchema(Otter) {
    
    // Validate each attribute on our schema
    for (let attrName in this.schema) {
      let attr = this.schema[attrName]
      
      // Give the attribute chance to validate itself
      attr.validateSelf(Otter, this)
      
      // Let the attribute process its options
      attr.processOptions(Otter, this)
    }
  }
  
  /**
   * Validates a set of values agains the schema, using the attributes
   * @param  {object} values The values to check
   */
  static validateValuesAgainstSchema(values) {
    
    // Loop through each of our attributes
    for (let attrName in this.schema) {
      
      // Let it validate its value
      this.schema[attrName].validateModelValue(values[attrName])
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
  
  
  
  
  /** Creates a new instance of this model */
  constructor(values = {}) {
    
    // Store the values for attributes to access
    Object.defineProperty(this, 'values', {
      enumerable: false,
      writable: true,
      value: values
    })
    
    // Use our attributes to install getters & setters
    for (let name in this.schema) {
      this.schema[name].installOn(this)
    }
  }
  
  
  
  /** Gets the adapter used to connect this model to the database */
  get adapter() { return getClass(this).adapter }
  
  /** Gets the schema defining the structure of this model */
  get schema() { return getClass(this).schema }
  
  
  
  
  /**
   * Checks the values stored are valid
   * @return {Ottter.Types.Error} The first error that was thrown, or null
   */
  validate() {
    try {
      this.adapter.validateModelValues(this.modelName, this.values)
    }
    catch (error) {
      return error
    }
  }
  
  
  
  
  // Customisation
  inspect() {
    let className = this.constructor.name
    
    let Self = {
      [className]: function(values) { Object.assign(this, values) }
    }[className]
    
    return new Self(this)
  }
  toJSON() {
    return this
  }
}


Cluster._schema = null
Cluster._adapter = null


// Return our class
module.exports = Cluster
