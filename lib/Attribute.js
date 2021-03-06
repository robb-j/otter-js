const OtterError = require('./errors/OtterError')
const { valOrCallFunc, undefOrNull } = require('./utils')

/**
 * The different types of values tha a model can store, subclass to add new types.
 * You'll also have to modify an adapter to make sure it supports any new attributes.
 * Attributes are used to parse config from Model definitions and are stored statically on the YourModel.schema
 * @type {Otter.Types.Attribute}
 */
class Attribute {
  
  /** @type {String} The name of the attribute */
  get name() { return this._name }
  
  /** @type {String} The name of the model that owns this attribute */
  get modelName() { return this._modelName }
  
  /** @type {String} The configuration passed to the attribute, defined on the Model */
  get options() { return this._options }
  
  /** @type {String} A friendly name to identify this attribute */
  get fullName() { return `${this.modelName}.${this.name}` }
  
  /** @type {String} The type of this attribute, used for comparisons */
  get valueType() { return null }
  
  
  /** @type {Boolean} If values of this attribute should be hidden from output & json */
  get isProtected() { return this._options.protect }
  
  /** @type {Boolean} If values of this attribute should be hidden from output & json */
  get isRequired() { return this._options.required }
  
  /** @type {any} The default value of this attribute */
  get defaultValue() { return this._options.default }
  
  /** @type {any[]} The configured enum option, or null if not set */
  get enumOptions() { return this._options.enum }
  
  /**  @type {any} A custom value validator, or null if not set  */
  get validator() { return this._options.validator }
  
  
  
  
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
      throw OtterError.fromCode('attr.opts.protectIsBool', this)
    }
    
    
    // If passed, make sure 'required' is a boolean
    if (!undefOrNull(options.required) && typeof options.required !== 'boolean') {
      throw OtterError.fromCode('attr.opts.requiredIsBool', this)
    }
    
    
    // Validate & proceses options
    this._options.enum = this.processEnumOption(options.enum)
    this._options.validator = this.processValidatorOption(options.validator)
    this._options.required = this._options.required === true
    this._options.protect = this._options.protect === true
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
      if (this.defaultValue !== undefined) {
        model.values[name] = valOrCallFunc(this.defaultValue)
      }
      else {
        model.values[name] = null
      }
    }
    
    
    // Add the property onto the model w/ a getter and setter
    Object.defineProperty(model, name, {
      enumerable: true,
      configurable: false,
      get() { return model.values[name] },
      set(val) { model.values[name] = val }
    })
  }
  
  /**
   * Custom names and the options key they map to, used for defining shorthands
   */
  static customNameMap() { return {} }
  
  /**
   * Allows subclasses to process their options to prepare for use, called after `validateSelf` so the attributes should already be valid
   * @param {Otter} Otter The otter instance the attribute was added to
   * @param {Otter.Types.Model} ModelType The model the attribute was defined on
   */
  processOptions(Otter, ModelType) { }
  
  /**
   * Determine's if the attribute was defined correctly, subclass to add logic & throw errors if needed, no need to call super
   * @param {Otter} Otter The otter instance the attribute was added to
   * @param {Otter.Types.Model} ModelType The model the attribute was defined on
   */
  validateSelf(Otter, ModelType) { }
  
  
  
  /** Validate if a value can be set onto this attribute */
  validateModelValue(value) {
    
    // Skip if not required and theres no value, error if required & missing
    if (undefOrNull(value)) {
      if (!this.isRequired) return
      else throw OtterError.fromCode('attr.validation.missing', this)
    }
    
    // Check #valueMatchesType
    if (!this.valueMatchesType(value)) {
      throw OtterError.fromCode('attr.validation.type', this, value)
    }
    
    // Check enum options
    if (this.enumOptions && !this.enumOptions.includes(value)) {
      throw OtterError.fromCode('attr.validation.enum', this, value)
    }
    
    // Call validator
    if (this.validator && !this.validator(value)) {
      throw OtterError.fromCode('attr.validation.custom', this, value)
    }
    
  }
  
  /** Whether a value matches the type of this Attribute */
  valueMatchesType(value) {
    return typeof value === this.valueType
  }
  
  
  
  
  /**
   * Processes an enum passed in 'options' to get array value
   * - Will call function if passed one
   * - Throws if set and not an array
   * - Throws if set and all values do no pass Attribute#valueMatchesType
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
      throw OtterError.fromCode('attr.opts.invalidEnum', this)
    }
    
    
    // See if all values are the correct type
    let correctType = enumVals.reduce((correct, value) => {
      return correct && this.valueMatchesType(value)
    }, true)
    
    
    // Fail if all values are not the type of this attribute
    if (!correctType) {
      throw OtterError.fromCode('attr.opts.invalidEnumVals', this, this.valueType)
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
      throw OtterError.fromCode('attr.opts.invalidValidator', this)
    }
    
    
    // Return the function, modified to have the attribute as 'this'
    return validatorOption.bind(this)
  }
  
  /**
   * Prepare a value to be passed to a query
   * @param {any} value The input to process
   * @return {any}
   */
  prepareValueForQuery(value) {
    return value
  }
}


module.exports = Attribute
