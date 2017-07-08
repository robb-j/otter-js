const Attribute = require('../Attribute')

/** An attribute representing the storage of a number */
module.exports = class Number extends Attribute {
  
  // ...
  get valueType() { return 'number' }
}
