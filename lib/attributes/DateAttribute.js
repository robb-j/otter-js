const Attribute = require('../Attribute')

/** An attribute representing the storage of a date */
module.exports = class DateAttribute extends Attribute {
  
  get valueType() { return 'object' }
  
  valueMatchesType(value) {
    return (value.constructor && value.constructor.name) === 'Date'
  }
}
