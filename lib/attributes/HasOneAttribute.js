const RelationType = require('../utils/RelationType')
const Attribute = require('../Attribute')
const AttributeError = require('../errors/AttributeError')
const { undefOrNull } = require('../utils')

module.exports = class HasOne extends RelationType(Attribute) {
  
  static customNameMap() {
    return { hasOne: 'model' }
  }
  
  get valueType() { return 'string' }
  
  
  /** The model this relation points to, set on Otter.start() */
  get targetModel() { return this.options.targetModel }
  
  
  
  validateSelf(Otter, ModelType) {
    
    // Fail if a model wasn't specified
    if (undefOrNull(this.options.model)) {
      throw AttributeError.fromCode('attr.relation.missingModel', this)
    }
    
    // Check therelation is valid
    this.validateModel(Otter, ModelType, this.options.model)
  }
  
  processOptions(Otter, ModelType) {
    
    // Store the related model for later use
    this.storeRelatedType(Otter, this.options.model)
  }
  
  installOn(model) {
    
    // Cache values for properties ('this' is rebound)
    let name = this.name
    let idName = `${this.name}_id`
    let TargetModel = this.targetModel
    
    // TODO: Default the value to 'null'
    model.values[name] = model.values[name] || null
    
    // Define the accessor method
    Object.defineProperty(model, name, {
      enumerable: false,
      configurable: false,
      value() {
        if (!this.values[name]) return null
        return TargetModel.findOne(this[idName])
      }
    })
    // Object.defineProperty(model, name, {
    //   enumerable: false,
    //   configurable: false,
    //   get() {
    //     if (!this.values[name]) return null
    //     return TargetModel.findOne(this[idName])
    //   },
    //   set(val) {
    //     if (val instanceof TargetModel) model.values[name] = val.id
    //   }
    // })
    
    // Define the id attribute
    Object.defineProperty(model, idName, {
      enumerable: true,
      configurable: false,
      get() { return model.values[name] },
      set(val) { model.values[name] = val }
    })
  }
}
