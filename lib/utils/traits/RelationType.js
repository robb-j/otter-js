const AttributeError = require('../../errors/AttributeError')
const undefOrNull = require('./../undefOrNull')

module.exports = (Type) => class RelationType extends Type {
  
  validateModel(Otter, ModelType, typeName) {
    
    let TargetType = Otter.active.models[typeName]
    
    if (undefOrNull(TargetType) || TargetType.adapter !== ModelType.adapter) {
      throw AttributeError.fromCode('attr.relation.invalidModel', this, typeName)
    }
    
  }
  
  relatedType(Otter, typeName) {
    return Otter.active.models[typeName]
  }

}
