const Attribute = require('../Attribute')

/** An attribute representing the storage of a string */
module.exports = class StringAttribute extends Attribute {
  
  // ...
  get valueType() { return 'string' }
}
