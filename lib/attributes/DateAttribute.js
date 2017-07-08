const Attribute = require('../Attribute')

/** An attribute representing the storage of a date */
module.exports = class Date extends Attribute {
  
  get valueType() { return 'object' }
}
