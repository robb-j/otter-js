const Attribute = require('../Attribute')

/** An attribute representing the storage of a date */
module.exports = class Date extends Attribute {
  
  get valueType() { return 'object' }
  
  valueMatchesType(value) {
    return (value.constructor && value.constructor.name) === 'Date'
  }
}
