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
   * If values of this attribute should be hidden from output & json
   * @type {Boolean}
   */
  get isProtected() { return this._options.protect !== false }
  
  
  /**
   * If values of this attribute should be hidden from output & json
   * @type {Boolean}
   */
  get isRequired() { return this._options.required !== false }
  
  
  /**
   * Creates a new Attribute
   * @param  {String} name The name the model gave this attribute
   * @param  {String} modelName The name of the model class this attribute is on
   * @param  {null|object} options The configuration the model provided for this attribute
   */
  constructor(name, modelName, options = {}) {
    this._name = name
    this._modelName = modelName
    this._options = options
    
    
    // If passed, make sure 'protect' is a boolean
    if (!undefOrNull(options.protect) && typeof options.protect !== 'boolean') {
      throw new Error(`${this.fullName}: 'protect' must be a Boolean`)
    }
    
    
    // If passed, make sure 'required' is a boolean
    if (!undefOrNull(options.required) && typeof options.required !== 'boolean') {
      throw new Error(`${this.fullName}: 'required' must be a Boolean`)
    }
    
    
    // Validate & proceses options
    this.enumOptions = this.processEnumOption(options.enum)
    this.validator = this.processValidatorOption(options.validator)
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
   * Determine's if the attribute was defined correctly, subclass to add logic & throw errors if needed, no need to call super
   * @param  {Otter} Otter The otter instance the attribute was added to
   * @param  {Otter.Types.Model} modelType The model the attribute was defined on
   */
  validateSelf(Otter, modelType) { }
  
  
  
  /** Validate if a value can be set onto this attribute */
  validateModelValue(value) {
    
    // Check enum options
    
    // Call validator
    
    // ...
  }
  
  /** Validate if a value can be used to query this attribute */
  validateQueryValue(value) {
    
    // ...
  }
  
  
  
  
  /**
   * Processes an enum passed in 'options' to get array value
   * - Will call function if passed one
   * - Throws if set and not an array
   * - Throws if set and all values are not of type this.valueType
   * @param  {any} enumOption The value passed from attribute options
   * @return {null|array<valueType>}
   */
  processEnumOption(enumOption) {
    
    // Do nothing if no enum is passed
    if (!enumOption) { return null }
    
    
    // Get the value or call a function to get the value
    let enumVals = valOrCallFunc(enumOption)
    
    
    // Fail if not an array
    if (!Array.isArray(enumVals)) {
      throw new Error(`${this.fullName}: Invalid enum`)
    }
    
    
    // See if all values are the correct type
    let correctType = enumVals.reduce((correct, value) => {
      return correct && typeof value === this.valueType
    }, true)
    
    
    // Fail if all values are not the type of this attribute
    if (!correctType) {
      throw new Error(`${this.fullName}: Invalid enum values, must be '${this.valueType}'`)
    }
    
    
    // Return the values
    return enumVals
  }
  
  /**
   * Processes a validatior passed in 'options' to get validator function
   * - Rebind's this of the function to us (The Attribute)
   * - Throws if set and not a function
   * @param  {[type]} validatorOption [description]
   * @return {[type]}                 [description]
   */
  processValidatorOption(validatorOption) {
    
    // Do nothing if nothing was passed
    if (!validatorOption) { return null }
    
    
    // Fail if not a fucntion
    if (typeof validatorOption !== 'function') {
      throw new Error(`${this.fullName}: Invalid validator`)
    }
    
    
    // Return the function, modified to have the attribute as 'this'
    return validatorOption.bind(this)
  }
}


module.exports = Attribute
