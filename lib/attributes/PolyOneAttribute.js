const Attribute = require('../Attribute')
const Cluster = require('../Cluster')
const AttributeError = require('../errors/AttributeError')
const { PolymorphicType, AddTraits, undefOrNull } = require('../utils')


module.exports = class PolyOneAttribute extends AddTraits(Attribute, PolymorphicType) {
  
  static customNameMap() {
    return { poly: 'clusters' }
  }
  
  get valueType() { return 'object' }
  
  get PolyTypes() { return this.options.Types }
  
  get enumOptions() { return null /* Don't allow enums */ }
  
  validateSelf(Otter, ModelType) {
    this.validateTypes(Otter, ModelType, this.options.clusters)
  }
  
  processOptions(Otter, ModelType) {
    this.options.Types = this.processTypes(Otter, ModelType, this.options.clusters)
  }
  
  
  installOn(model) {
    
    // Cache values for property
    let name = this.name
    let PolyTypes = this.PolyTypes
    
    
    // The cluster instance
    let cluster = null
    
    
    // Define the property onto the model
    Object.defineProperty(model, name, {
      enumerable: true,
      configurable: false,
      get() {
        return Object.assign(cluster || {}, {
          _type: (cluster && cluster.constructor.name) || null
        })
      },
      set(newValue) {
        
        if (newValue instanceof Cluster) {
          if (!PolyTypes[newValue.constructor.name]) return
          cluster = newValue
        }
        else if (undefOrNull(newValue)) {
          cluster = null
        }
        else if (typeof newValue === 'object' && PolyTypes[newValue._type]) {
          cluster = new PolyTypes[newValue._type](newValue)
        }
        
        if (!cluster) {
          model.values[name] = null
        }
        else if (model.values[name] !== cluster.values) {
          model.values[name] = cluster.values
          model.values[name]._type = cluster.constructor.name
        }
      }
    })
    
    
    // Set the initial value
    model[name] = model.values[name]
    
  }
  
  validateModelValue(value) {
    
    // Use the base validation
    super.validateModelValue(value)
    
    // Ignore if not set, would have already failed if required
    if (!value) return
    
    
    // Validate the type
    if (!value._type || !this.PolyTypes[value._type]) {
      throw AttributeError.fromCode('attr.poly.invalidType', this, value._type)
    }
    
    
    // Validate using the type
    this.PolyTypes[value._type].validateValuesAgainstSchema(value)
    
  }
  
  
  
  
}
