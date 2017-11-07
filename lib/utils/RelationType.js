// const Attribute = require('../Attribute')

const undefOrNull = require('./undefOrNull')

module.exports = (Type) => class RelationType extends Type {

  get targetModel() { return this.options.targetModel }

  // ...

  validateRelation(Otter, modelType, targetTypeName) {
    
    if (undefOrNull(targetTypeName)) {
      throw new Error(`${modelType.name}.${this.name}: No model specified`)
    }
    
    let targetType = Otter.active.models[targetTypeName]
    
    if (undefOrNull(targetType)) {
      throw new Error(`${modelType.name}.${this.name}: Invalid model specified '${this.options.model}'`)
    }
    
  }
  
  storeRelatedType(Otter, targetType) {
    this.options.targetModel = Otter.active.models[targetType]
  }

}
