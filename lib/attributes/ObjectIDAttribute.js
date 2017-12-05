const Attribute = require('../Attribute')

const mongodb = require('mongodb')

/** An attribute representing the storage of a mongo ObjectID */
module.exports = class ObjectIDAttribute extends Attribute {
  
  get valueType() { return 'string' }
  
  valueMatchesType(value) {
    return (value && value.constructor && value.constructor.name) === 'ObjectID' ||
      (typeof value === 'string' && value.length === 24)
  }
  
  prepareValueForQuery(value) {
    return typeof value === 'string' ? new mongodb.ObjectID(value) : value
  }
}
