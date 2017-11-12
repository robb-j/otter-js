const RelationType = require('../utils/RelationType')
const Attribute = require('../Attribute')
const HasOne = require('./HasOneAttribute')
const AttributeError = require('../errors/AttributeError')
const { undefOrNull } = require('../utils')

/** An Attribute that defines a one-to-many relation to another model, using a HasOne on the other model */
module.exports = class HasMany extends RelationType(Attribute) {
  
  /** Allow creation with { hasMany: 'MyModel via someAttrib' } */
  static customNameMap() {
    return { hasMany: 'model' }
  }
  
  /** The name of the HasOne attribute on the target model */
  get targetAttr() { return this.options.targetAttr }
  
  /** Validates the attribute was setup correctly */
  validateSelf(Otter, ModelType) {
    
    // Fail if a model wasn't specified
    if (undefOrNull(this.options.model)) {
      throw AttributeError.fromCode('attr.relation.missingModel', this)
    }
    
    // Get the target model & attribute names from our options
    let target = this.getRelation(Otter)
    
    
    // Check the related model exists
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
  
  /** Store the related model & attribute to relate with */
  processOptions(Otter, ModelType) {
    
    let target = this.getRelation(Otter)
    this.options.model = target.typeName
    this.options.targetAttr = target.attrName
    
    // Store the related model for later use
    this.storeRelatedType(Otter, target.typeName)
  }
  
  /** Gets the model and attribute names that form our relation (either from options or using via syntax) */
  getRelation(Otter) {
    
    // See if the attribute was defined using 'Model via attribute' syntax
    let typeName, attrName
    let viaMatch = this.options.model.match(/^(\w+)\svia+\s(\w+)$/)
    
    
    // If using a via syntax, deconstruct it form the regex capture groups
    if (viaMatch) {
      typeName = viaMatch[1]
      attrName = viaMatch[2]
    }
    else {
      
      // Default to using the values in our options
      typeName = this.options.model
      attrName = this.options.via
    }
    
    return { typeName, attrName }
  }
  
  installOn(model) {
    
    // Cache values for properties ('this' gets rebound when defining props)
    let name = this.name
    let idName = this.targetAttr
    let TargetModel = this.targetModel
    let targetIdType = TargetModel.schema[this.targetAttr].valueType
    
    
    // Make a relation 'object' which is the defaul accessor
    let relation = function() {
      return TargetModel.find({ [idName]: this.id })
    }
    
    // Add the #add() method to add a model to the relation
    relation.add = function(child) {
      child[`${idName}_id`] = model.id
      return child.save()
    }
    
    // Add the #remove(args) method to remove models from the relation
    // Can pass: an id, a model instance, an array of ids or an array of model instances
    relation.remove = function(arg) {
      
      // If an id type, place into an array
      if (typeof arg === targetIdType) { arg = [ arg ] }
      
      // If an instance, place the id into an array
      if (arg instanceof TargetModel) { arg = [ arg.id ] }
      
      // If we were passed or now have an array, process that
      if (Array.isArray(arg)) {
        
        // Check if an array of instance or an array of ids
        let isInstances = arg.reduce((flag, elem) => flag && elem instanceof TargetModel, true)
        let isIds = arg.reduce((flag, elem) => flag && typeof elem === targetIdType, true)
        
        // If instance, map them to ids
        if (isInstances) {
          arg = arg.map(model => model.id)
          isIds = true
        }
        
        // If an array of ids, update them setting their relation to null
        if (isIds) {
          return TargetModel.update(arg, { [idName]: null })
        }
      }
      
      // If we reached here we couldn't interpret the arguements, so throw an error
      throw AttributeError.fromCode('attr.hasMany.invalidRemove', this)
    }
    
    // Adds the #clear() method which removes all values from a relation
    relation.clear = function() {
      return TargetModel.update({ [idName]: model.id }, { [idName]: null })
    }
    
    // Define the relation onto the model
    Object.defineProperty(model, name, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: relation
    })
    
  }
}
