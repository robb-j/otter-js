const Attribute = require('../Attribute')
const { undefOrNull } = require('../utils')

module.exports = class HasOne extends Attribute {
  
  static customNameMap() {
    return { hasOne: 'model' }
  }
  
  get valueType() { return 'string' }
  
  
  /** The model this relation points to, set on Otter.start() */
  get targetModel() { return this.options.targetModel }
  
  
  
  validateSelf(Otter, modelType) {
    
    // Fail if the model wasn't defined
    if (undefOrNull(this.options.model)) {
      throw new Error(`${modelType.name}.${this.name}: No model specified`)
    }
    
    // Fetch the related model
    this.options.targetModel = Otter.active.models[this.options.model]
    
    // Fail if the related model doesn't exist
    if (undefOrNull(this.targetModel)) {
      throw new Error(`${modelType.name}.${this.name}: Invalid model specified '${this.options.model}'`)
    }
    
    // TODO: Warn if a hasMany or hasOne was not declared on the other side?
  }
  
  installOn(model) {
    
    // Cache values for properties (this is rebound)
    let name = this.name
    let idName = `${this.name}_id`
    let TargetModel = this.targetModel
    
    // Define the accessor method
    Object.defineProperty(model, name, {
      enumerable: true,
      configurable: false,
      get() {
        return function() {
          return TargetModel.findOne(this[idName])
        }
      }
      // set(val) {
      //   model.values[name] = val instanceof TargetModel ? val.id : val
      //   console.log('SET', model.values[name])
      // }
    })
    
    // Define the id attribute
    Object.defineProperty(model, idName, {
      enumerable: true,
      configurable: false,
      get() { return model.values[name] },
      set(val) { model.values[name] = val }
    })
  }
}
