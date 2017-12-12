const Attribute = require('../Attribute')
const AttributeError = require('../errors/AttributeError')
const { undefOrNull, AddTraits, RelationType } = require('../utils')

/** An Attribute that defines a pointer to another Model */
module.exports = class HasOneAttribute extends AddTraits(Attribute, RelationType) {
  
  /** Allo creation with { hasOne: 'MyModel' } */
  static customNameMap() {
    return { hasOne: 'model' }
  }
  
  /** Internally match Strings */
  get valueType() { return 'string' }
  
  
  /** The model being related to */
  get TargetModel() { return this.options.targetModel }
  
  
  /** Proxy type checking to the id field on the targetModel */
  valueMatchesType(value) {
    let idAttr = this.TargetModel.schema.id
    return idAttr.valueMatchesType(value)
  }
  
  /** Proxy prep. to the id field on the targetModel */
  prepareValueForQuery(value) {
    let idAttr = this.TargetModel.schema.id
    return idAttr.prepareValueForQuery(value)
  }
  
  
  /** Validates the relation is valid before processing */
  validateSelf(Otter, ModelType) {
    
    // Fail if a model wasn't specified
    if (undefOrNull(this.options.model)) {
      throw AttributeError.fromCode('attr.relation.missingModel', this)
    }
    
    // Check the related model exists
    this.validateModel(Otter, ModelType, this.options.model)
  }
  
  /** Stores the related model ready for installOn */
  processOptions(Otter, ModelType) {
    
    // Store the related model for later use
    this.options.targetModel = this.relatedType(Otter, this.options.model)
  }
  
  /** Installs this attribute onto a model */
  installOn(model) {
    
    // Cache values for properties ('this' gets rebound when defining props)
    let name = this.name
    let idName = `${this.name}_id`
    let TargetModel = this.TargetModel
    
    // Default the value to 'null' if not already specified
    model.values[name] = model.values[name] || null
    
    // Define the accessor method, a function to fetch the related model
    Object.defineProperty(model, name, {
      enumerable: false,
      configurable: false,
      value() {
        if (!this.values[name]) return null
        return TargetModel.findOne(this.values[name])
      }
    })
    
    // Define the id attribute, get and set the id of the related model
    Object.defineProperty(model, idName, {
      enumerable: true,
      configurable: false,
      get() { return model.values[name] },
      set(val) { model.values[name] = val }
    })
  }
}
