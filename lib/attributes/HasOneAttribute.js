const Attribute = require('../Attribute')

module.exports = class HasOne extends Attribute {
  
  static customNameMap() {
    return { hasOne: 'model' }
  }
  
  get valueType() { return 'string' }
}
