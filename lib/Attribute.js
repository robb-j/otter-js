

module.exports = class Attribute {
  
  get name() { return this._name }
  get options() { return this._options }
  
  constructor(name, options) {
    
    this._name = name
    this._options = options || {}
  }
  
  validate(Otter) { }
}
