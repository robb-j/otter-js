// const Attribute = require('../Attribute')
const AttributeError = require('../errors/AttributeError')
const undefOrNull = require('./undefOrNull')

module.exports = (Type) => class RelationType extends Type {
  
  get targetModel() { return this.options.targetModel }
  
  
  
  validateModel(Otter, modelType, modelName) {
    
    let targetType = Otter.active.models[modelName]
    
    if (undefOrNull(targetType)) {
      throw AttributeError.fromCode('attr.relation.invalidModel', this, targetType)
    }
    
  }
  
  storeRelatedType(Otter, targetType) {
    this.options.targetModel = Otter.active.models[targetType]
  }

}
