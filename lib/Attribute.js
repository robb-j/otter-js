

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
  }
  
  validate(Otter) { }
}
