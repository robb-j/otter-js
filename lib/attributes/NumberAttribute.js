const Attribute = require('../Attribute')

/** An attribute representing the storage of a number */
module.exports = class NumberAttribute extends Attribute {
  
  // ...
  get valueType() { return 'number' }
}
