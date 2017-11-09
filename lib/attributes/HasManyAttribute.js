const RelationType = require('../utils/RelationType')
const Attribute = require('../Attribute')
const AttributeError = require('../errors/AttributeError')
const { undefOrNull } = require('../utils')

module.exports = class HasMany extends RelationType(Attribute) {
  
  static customNameMap() {
    return { hasMany: 'model' }
  }
  
  
  validateSelf(Otter, ModelType) {
    
    // Fail if a model wasn't specified
    if (undefOrNull(this.options.model)) {
      throw AttributeError.fromCode('attr.relation.missingModel', this)
    }
    
    let targetType = this.options.model
    let targetProp = this.options.via
    
    let viaMatch = this.options.model.match(/^(\w+)\svia+\s(\w+)$/)
    
    if (viaMatch) {
      targetType = viaMatch[1]
      targetProp = viaMatch[2]
    }
    
    // Check therelation is valid
    this.validateModel(Otter, ModelType, targetType)
    
    // TODO: Ensure the targetModel has a hasOne relation
    
    // Ensure a via field was specified
    if (!targetProp) {
      throw AttributeError.fromCode('attr.hasMany.noVia', this)
    }
    
    // TODO: Validate the property on the model
    // - Check it exists
    // - Check it is a HasOne Attribute
    // - Check it points to us
  }
  
  processOptions(Otter, ModelType) {
    
    // Store the related model for later use
    this.storeRelatedType(Otter, this.options.model)
  }
  
}
