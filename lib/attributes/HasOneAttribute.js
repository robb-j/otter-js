const RelationType = require('../utils/RelationType')
const Attribute = require('../Attribute')
const AttributeError = require('../errors/AttributeError')
const { undefOrNull, AddTraits } = require('../utils')

/** An Attribute that defines a pointer to another Model */
module.exports = class HasOne extends AddTraits(Attribute, RelationType) {
  
  /** Allo creation with { hasOne: 'MyModel' } */
  static customNameMap() {
    return { hasOne: 'model' }
  }
  
  /** Internally store the relation as a String */
  get valueType() { return 'string' }
  
  
  /** The model this relation points to, set on Otter.start() */
  get targetModel() { return this.options.targetModel }
  
  
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
    this.storeRelatedType(Otter, this.options.model)
  }
  
  /** Installs this attribute onto a model */
  installOn(model) {
    
    // Cache values for properties ('this' gets rebound when defining props)
    let name = this.name
    let idName = `${this.name}_id`
    let TargetModel = this.targetModel
    
    // Default the value to 'null' if not already specified
    model.values[name] = model.values[name] || null
    
    // Define the accessor method, a function to fetch the related model
    Object.defineProperty(model, name, {
      enumerable: false,
      configurable: false,
      value() {
        if (!this.values[name]) return null
        return TargetModel.findOne(this[idName])
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
