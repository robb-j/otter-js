const Attribute = require('../Attribute')

// const ObjectID = require('mongodb').ObjectID

/** An attribute representing the storage of a mongo ObjectID */
module.exports = class ObjectID extends Attribute {
  
  // ...
  get valueType() { return 'string' }
  
  
  // TODO: Test changes
  
  valueMatchesType(value) {
    return (value && value.constructor && value.constructor.name) === 'ObjectID' ||
      super.valueMatchesType(value)
  }
}
