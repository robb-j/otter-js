const AttributeError = require('../../errors/AttributeError')
const undefOrNull = require('./../undefOrNull')


AttributeError.registerTypes('attr.poly', {
  missingTypes: (attr) => `${attr.fullName} - No types specified, pass 'types' option`,
  invalidType: (attr, type) => `${attr.fullName} - Invalid Cluster type passed, '${type}'`
})


/**
 * An Attribute Trait that deals with polymorphic types
 */
module.exports = (Type) => class PolymorphicType extends Type {
  
  validateTypes(Otter, ModelType, types) {
    
    // Fail if not passed an array of types
    if (undefOrNull(types) || !Array.isArray(types)) {
      throw AttributeError.fromCode('attr.poly.missingTypes', this)
    }
    
    // Check each type is valid
    let errors = []
    types.forEach(typeName => {
      let ClusterType = Otter.active.clusters[typeName]
      if (!ClusterType || ClusterType.adapter !== ModelType.adapter) {
        errors.push(AttributeError.fromCode('attr.poly.invalidType', this, typeName))
      }
    })
    
    // If there were any errors, report them
    if (errors.length > 0) {
      throw AttributeError.composite(errors)
    }
  }
  
  processTypes(Otter, ModelType, types) {
    
    // Store a map of typeName -> ClusterType
    return types.reduce((map, typeName) => {
      return Object.assign(map, { [typeName]: Otter.active.clusters[typeName] })
    }, {})
    
  }

}
