const RelationType = require('../utils/RelationType')
const Attribute = require('../Attribute')
const HasOne = require('./HasOneAttribute')
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
    
    let targetTypeName = this.options.model
    let targetProp = this.options.via
    
    let viaMatch = this.options.model.match(/^(\w+)\svia+\s(\w+)$/)
    
    if (viaMatch) {
      targetTypeName = viaMatch[1]
      targetProp = viaMatch[2]
    }
    
    // Check therelation is valid
    this.validateModel(Otter, ModelType, targetTypeName)
    
    // TODO: Ensure the targetModel has a hasOne relation
    
    // Ensure a via field was specified
    if (!targetProp) {
      throw AttributeError.fromCode('attr.hasMany.noVia', this)
    }
    
    
    // Grab the target type and the related attribute
    let TargetType = Otter.active.models[targetTypeName]
    let targetAttr = TargetType.schema[targetProp]
    
    
    // Check the via attribute exists
    if (!targetAttr) {
      throw AttributeError.fromCode('attr.hasMany.missingVia', this, targetTypeName, targetProp)
    }
    
    
    // Check it is a HasOne Attribute to
    if (!(targetAttr instanceof HasOne) || targetAttr.options.model !== ModelType.name) {
      throw AttributeError.fromCode('attr.hasMany.invalidVia', this, targetTypeName, targetProp)
    }
  }
  
  processOptions(Otter, ModelType) {
    
    // Store the related model for later use
    this.storeRelatedType(Otter, this.options.model)
  }
  
}
