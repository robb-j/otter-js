const Attribute = require('../Attribute')

// const ObjectID = require('mongodb').ObjectID

/** An attribute representing the storage of a mongo ObjectID */
module.exports = class String extends Attribute {
  
  // ...
  get valueType() { return 'string' }
}
