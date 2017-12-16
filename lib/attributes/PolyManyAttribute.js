const Attribute = require('../Attribute')
const Cluster = require('../Cluster')
const { PolymorphicType, AddTraits } = require('../utils')
const AttributeError = require('../errors/AttributeError')


module.exports = class PolyManyAttribute extends AddTraits(Attribute, PolymorphicType) {
  
  static customNameMap() {
    return { polyList: 'clusters' }
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
    let clusters = null
    
    
    // Define the property onto the model
    Object.defineProperty(model, name, {
      enumerable: true,
      configurable: false,
      get() {
        
        // Gets a shallow copy of the clusters
        return Array.from(clusters)
      },
      set(newValue) {
        
        // Do nothing if not an array?
        if (!Array.isArray(newValue)) return
        
        // Generate the new clusters
        let newClusters = []
        newValue.forEach(value => {
          if (value instanceof Cluster && PolyTypes[value.constructor.name]) {
            newClusters.push(value)
          }
          else if (PolyTypes[value._type]) {
            newClusters.push(new PolyTypes[value._type](value))
          }
          else {
            // TODO: Throw an error!?
            console.log('ERRR')
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
    
    
    // Fail if not an array
    if (!Array.isArray(value)) {
      throw AttributeError.fromCode('attr.validation.notArray', this)
    }
    
    let errors = []
    let PolyTypes = this.PolyTypes
    
    const transformError = (index, error) => {
      error.message = `${this.fullName}[${index}]: ${error.message}`
      return error
    }
    
    
    value.forEach((elem, i) => {
      
      if (!elem._type || !PolyTypes[elem._type]) {
        errors.push(transformError(i, AttributeError.fromCode('attr.poly.invalidType', this, elem._type)))
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
    
    
    
    if (errors) {
      throw AttributeError.composite(errors)
    }
    
    
  }
  
}
