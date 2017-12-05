const Attribute = require('../Attribute')

/** An attribute representing the storage of a boolean */
module.exports = class BooleanAttribute extends Attribute {
  
  // The raw type that is stored
  get valueType() { return 'boolean' }
}
