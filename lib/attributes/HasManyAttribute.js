const RelationType = require('../utils/RelationType')
const Attribute = require('../Attribute')
const HasOne = require('./HasOneAttribute')
const AttributeError = require('../errors/AttributeError')
const { undefOrNull } = require('../utils')

module.exports = class HasMany extends RelationType(Attribute) {
  
  static customNameMap() {
    return { hasMany: 'model' }
  }
  
  
  get targetAttr() { return this.options.targetAttr }
  
  
  validateSelf(Otter, ModelType) {
    
    // Fail if a model wasn't specified
    if (undefOrNull(this.options.model)) {
      throw AttributeError.fromCode('attr.relation.missingModel', this)
    }
    
    let target = this.getRelation(Otter)
    
    
    // Check therelation is valid
    this.validateModel(Otter, ModelType, target.typeName)
    
    
    // Ensure a via field was specified
    if (!target.attrName) {
      throw AttributeError.fromCode('attr.hasMany.noVia', this)
    }
    
    
    // Grab the target type and the related attribute
    let TargetType = Otter.active.models[target.typeName]
    let targetAttr = TargetType.schema[target.attrName]
    
    
    // Check the via attribute exists
    if (!targetAttr) {
      throw AttributeError.fromCode('attr.hasMany.missingVia', this, target.typeName, target.attrName)
    }
    
    
    // Check it is a HasOne Attribute to
    if (!(targetAttr instanceof HasOne) || targetAttr.options.model !== ModelType.name) {
      throw AttributeError.fromCode('attr.hasMany.invalidVia', this, target.typeName, target.attrName)
    }
  }
  
  processOptions(Otter, ModelType) {
    
    let target = this.getRelation(Otter)
    this.options.model = target.typeName
    this.options.targetAttr = target.attrName
    
    // Store the related model for later use
    this.storeRelatedType(Otter, target.typeName)
  }
  
  getRelation(Otter) {
    
    let typeName, attrName
    let viaMatch = this.options.model.match(/^(\w+)\svia+\s(\w+)$/)
    
    if (viaMatch) {
      typeName = viaMatch[1]
      attrName = viaMatch[2]
    }
    else {
      typeName = this.options.model
      attrName = this.options.via
    }
    
    return { typeName, attrName }
  }
  
  installOn(model) {
    
    // ...
    
    // ...
    
    let name = this.name
    let idName = this.targetAttr
    let TargetModel = this.targetModel
    let targetIdType = TargetModel.schema[this.targetAttr].valueType
    
    let relation = function() {
      return TargetModel.find({ [idName]: this.id })
    }
    
    relation.add = function(child) {
      child[`${idName}_id`] = model.id
      return child.save()
    }
    
    relation.remove = function(arg) {
      if (typeof arg === targetIdType) {
        arg = [ arg ]
      }
      if (arg instanceof TargetModel) {
        arg = [ arg.id ]
      }
      if (Array.isArray(arg)) {
        let isInstances = arg.reduce((flag, elem) => flag && elem instanceof TargetModel, true)
        let isIds = arg.reduce((flag, elem) => flag && typeof elem === targetIdType, true)
        
        if (isInstances) {
          arg = arg.map(model => model.id)
          isIds = true
        }
        
        if (isIds) {
          return TargetModel.update(arg, { [idName]: null })
        }
      }
      
      // If we reached here we couldn't interpret the arguements
      throw AttributeError.fromCode('attr.hasMany.invalidRemove', this)
    }
    
    relation.clear = function() {
      return TargetModel.update({ [idName]: model.id }, { [idName]: null })
    }
    
    Object.defineProperty(model, name, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: relation
    })
    
  }
}
