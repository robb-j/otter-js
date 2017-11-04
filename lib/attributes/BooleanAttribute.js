const Attribute = require('../Attribute')

/** An attribute representing the storage of a boolean */
module.exports = class Boolean extends Attribute {
  
  // The raw type that is stored
  get valueType() { return 'boolean' }
}
