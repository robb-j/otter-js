const RelationType = require('../utils/RelationType')
const Attribute = require('../Attribute')

module.exports = class HasMany extends RelationType(Attribute) {
  
  static customNameMap() {
    return { hasMany: 'model' }
  }
  
  // get targetModel() { return this.options.targetModel }
  
  validateSelf(Otter, modelType) {
    
    this.validateRelation(Otter, modelType, this.options.model)
    
    this.storeRelatedType(Otter, this.options.model)
    
    // TODO: Ensure the targetModel has a hasOne relation
  }
  
}

// Object.assign(module.exports, RelationType)
