const Attribute = require('../Attribute')

/** An attribute representing the storage of a string */
module.exports = class Boolean extends Attribute {
  
  // ...
  get valueType() { return 'boolean' }
}
