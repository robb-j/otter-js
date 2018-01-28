const Attribute = require('../Attribute')
const Cluster = require('../Cluster')
const { PolymorphicType, AddTraits } = require('../utils')
const OtterError = require('../errors/OtterError')


function addTypeToCluster(cluster, type) {
  Object.defineProperty(cluster, '_type', {
    enumerable: false,
    configurable: true,
    writable: false,
    value: type
  })
}


module.exports = class PolyManyAttribute extends AddTraits(Attribute, PolymorphicType) {
  
  static customNameMap() {
    return { polyMany: 'clusters' }
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
    let clusters = []
    
    
    class PolyArray extends Array {
      push(...items) {
        model[name] = clusters.concat(items)
      }
    }
    
    
    // Define the property onto the model
    Object.defineProperty(model, name, {
      enumerable: true,
      configurable: false,
      get() {
        
        // Gets a shallow copy of the clusters
        return PolyArray.from(clusters)
      },
      set(newValue) {
        
        // Do nothing if not an array?
        if (!Array.isArray(newValue)) return
        
        // Generate the new clusters
        let newClusters = []
        newValue.forEach(value => {
          if (value instanceof Cluster && PolyTypes[value.constructor.name]) {
            addTypeToCluster(value, value.constructor.name)
            newClusters.push(value)
          }
          else if (PolyTypes[value._type]) {
            let cluster = new PolyTypes[value._type](value)
            addTypeToCluster(cluster, value._type)
            newClusters.push(cluster)
          }
          else {
            // TODO: Throw an error!?
          }
        })
        
        // Store the clusters & put into model.values
        clusters = newClusters
        model.values[name] = newClusters.map(elem => {
          return Object.assign({ _type: elem.constructor.name }, elem.values)
        })
        
      }
    })
    
    
    // Set the initial value
    model[name] = model.values[name]
    
  }
  
  
  
  validateModelValue(value) {
    
    // Let super validate
    super.validateModelValue(value)
    
    
    // Don't validate if theres no value
    // It would have already failed if it is required
    if (!value) return
    
    
    // Fail if not an array
    if (!Array.isArray(value)) {
      throw OtterError.fromCode('attr.validation.notArray', this)
    }
    
    let errors = []
    let PolyTypes = this.PolyTypes
    
    const transformError = (index, error) => {
      error.message = `${this.fullName}[${index}]: ${error.message}`
      return error
    }
    
    
    value.forEach((elem, i) => {
      
      if (!elem._type || !PolyTypes[elem._type]) {
        errors.push(transformError(i, OtterError.fromCode('attr.poly.invalidType', this, elem._type)))
      }
      else {
        try {
          PolyTypes[elem._type].validateValuesAgainstSchema(elem)
        }
        catch (error) {
          errors = errors.concat(error.subErrors.map(e => transformError(i, e)))
        }
      }
      
      
    })
    
    
    
    if (errors.length > 0) {
      throw OtterError.composite(errors)
    }
    
    
  }
  
}
