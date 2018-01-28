const OtterError = require('../../errors/OtterError')
const undefOrNull = require('./../undefOrNull')

module.exports = (Type) => class RelationType extends Type {
  
  validateModel(Otter, ModelType, typeName) {
    
    let TargetType = Otter.active.models[typeName]
    
    if (undefOrNull(TargetType) || TargetType.adapter !== ModelType.adapter) {
      throw OtterError.fromCode('attr.relation.invalidModel', this, typeName)
    }
    
  }
  
  relatedType(Otter, typeName) {
    return Otter.active.models[typeName]
  }

}
