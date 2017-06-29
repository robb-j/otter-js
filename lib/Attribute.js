
const { valOrCallFunc, undefOrNull } = require('./utils')

module.exports = class Attribute {
  
  get name() { return this._name }
  get modelName() { return this._modelName }
  get options() { return this._options }
  get fullName() { return `${this.modelName}.${this.name}` }
  get valueType() { return null }
  
  constructor(name, modelName, options) {
    this._name = name
    this._modelName = modelName
    this._options = options || {}
    
    // TODO: validate options ...
  }
  
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
  
  validate(Otter) { }
}
