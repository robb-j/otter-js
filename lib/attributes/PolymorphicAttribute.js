const Attribute = require('../Attribute')
const Cluster = require('../Cluster')
const AttributeError = require('../errors/AttributeError')
const { undefOrNull } = require('../utils')


AttributeError.registerTypes('attr.poly', {
  missingTypes: (attr) => `${attr.fullName} - No types specified, pass 'types' option`,
  invalidType: (attr, type) => `${attr.fullName} - Invalid Cluster type passed, '${type}'`
})


module.exports = class PolymorphicAttribute extends Attribute {
  
  static customNameMap() {
    return { poly: 'types' }
  }
  
  get valueType() { return 'object' }
  
  get PolyTypes() { return this.options.Types }
  
  get enumOptions() { return null /* Don't allow enums */ }
  
  validateSelf(Otter, ModelType) {
    
    // Fail if not passed an array of types
    if (undefOrNull(this.options.types) || !Array.isArray(this.options.types)) {
      throw AttributeError.fromCode('attr.poly.missingTypes', this)
    }
    
    // Check each type is valid
    let errors = []
    this.options.types.forEach(typeName => {
      let type = Otter.active.clusters[typeName]
      if (!type) errors.push(AttributeError.fromCode('attr.poly.invalidType', this, typeName))
    })
    
    if (errors.length > 0) {
      throw AttributeError.composite(errors)
    }
  }
  
  processOptions(Otter, ModelType) {
    
    // Store a map of typeName -> ClusterType
    this.options.Types = this.options.types.reduce((map, typeName) => {
      return Object.assign(map, { [typeName]: Otter.active.clusters[typeName] })
    }, {})
    
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
  
}
