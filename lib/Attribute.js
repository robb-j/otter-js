const { valOrCallFunc, undefOrNull } = require('./utils')

/**
 * The different types of values tha a model can store, subclass to add new types.
 * You'll also have to modify an adapter to make sure it supports any new attributes.
 * Attributes are used to parse config from Model definitions and are stored statically on the YourModel.schema
 * @type {Otter.Types.Attribute}
 */
class Attribute {
  
  /** The name of the attribute
   * @type {String}
   */
  get name() { return this._name }
  
  /**
   * The name of the model that owns this attribute
   * @type {String}
   */
  get modelName() { return this._modelName }
  
  /**
   * The configuration passed to the attribute, defined on the Model
   * @type {String}
   */
  get options() { return this._options }
  
  /**
   * A friendly name to identify this attribute
   * @type {String}
   */
  get fullName() { return `${this.modelName}.${this.name}` }
  
  /**
   * The type of this attribute, used for comparisons
   * @type {String}
   */
  get valueType() { return null }
  
  
  /**
   * Creates a new Attribute
   * @param  {String} name The name the model gave this attribute
   * @param  {String} modelName The name of the model class this attribute is on
   * @param  {null|object} options The configuration the model provided for this attribute
   */
  constructor(name, modelName, options) {
    this._name = name
    this._modelName = modelName
    this._options = options || {}
    
    // TODO: validate options ...
  }
  
  /**
   * Installs an attribute onto a model subclass, adding getts & setters for the value.
   * Also applies a default value if passed in options
   * @param  {Otter.Types.Model} model The model to install on
   */
  installOn(model) {
    
    // Cache our name (for the getter)
    let name = this.name
    
    
    // If no value set, use the default value
    if (undefOrNull(model.values[name])) {
      model.values[name] = this.options.default ? valOrCallFunc(this.options.default) : null
    }
    
    
    // Add the property onto the model w/ a getter and setter
    Object.defineProperty(model, name, {
      enumerable: true,
      configurable: false,
      get() { return this.values[name] },
      set(val) { this.values[name] = val }
    })
  }
  
  /**
   * Determine's if the attribute was defined correctly, subclass to add logic & throw errors if needed
   * @param  {Otter} Otter The otter instance the attribute was added to
   * @param  {Otter.Types.Model} modelType The model the attribute was defined on
   */
  validate(Otter, modelType) { }
}


module.exports = Attribute
