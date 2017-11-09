// const Attribute = require('../Attribute')

const undefOrNull = require('./undefOrNull')

module.exports = (Type) => class RelationType extends Type {
  
  get targetModel() { return this.options.targetModel }
  
  
  
  validateModel(Otter, modelType, modelName) {
    
    let targetType = Otter.active.models[modelName]
    
    if (undefOrNull(targetType)) {
      throw new Error(`${modelType.name}.${this.name}: Invalid model specified '${modelName}'`)
    }
    
  }
  
  storeRelatedType(Otter, targetType) {
    this.options.targetModel = Otter.active.models[targetType]
  }

}
