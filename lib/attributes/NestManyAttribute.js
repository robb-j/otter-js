const Attribute = require('../Attribute')
const AttributeError = require('../errors/AttributeError')
const { AddTraits, NestingType, AssociativeType } = require('../utils')


module.exports = class NestManyAttribute extends AddTraits(Attribute, NestingType, AssociativeType) {
  
  static customNameMap() {
    return { nestMany: 'cluster' }
  }
  
  
  // TODO:
  associatedCluster() { return this.ClusterType }
  
  associationCategory() { return 'many' }
  
  
  
  validateSelf(Otter, ModelType) {
    
    // Validate the passed cluster
    this.validateOptions(this.options, Otter, ModelType)
  }
  
  processOptions(Otter, ModelType) {
    
    // Store the cluster type
    this.storeClusterType(this.options, Otter)
  }
  
  installOn(model) {
    
    let name = this.name
    let ClusterType = this.ClusterType
    
    let clusters = []
    
    class ClusterArray extends Array {
      push(...elems) {
        model[name] = clusters.concat(elems)
      }
    }
    
    Object.defineProperty(model, name, {
      enumerable: true,
      configurable: false,
      get() {
        return ClusterArray.from(clusters)
      },
      set(newValue) {
        
        // Skip if not an Array
        if (!Array.isArray(newValue)) { return }
        
        
        let newClusters = []
        newValue.forEach((elem, i) => {
          
          if (elem instanceof ClusterType) {
            newClusters.push(elem)
          }
          else if (typeof elem === 'object') {
            newClusters.push(new ClusterType(elem))
          }
          else {
            // TODO: Throw an error!?
          }
        })
        
        clusters = newClusters
        model.values[name] = newClusters.map(c => c.values)
        
        
        // // If not an array of ClusterTypes, attempt to process into them
        // if (!newValue.every(v => v instanceof ClusterType)) {
        //   if (!newValue.every(v => typeof v === 'object')) return
        //   newValue = newValue.map(obj => new ClusterType(obj))
        // }
        
        // Assign a shallow copy
        // model.values[name] = newValue
      }
    })
    
    // Set the initial value
    model[name] = model.values[name]
  }
  
  validateModelValue(value) {
    
    // Use the base validation
    super.validateModelValue(value)
    
    
    // Skip if no value
    if (!value) return
    
    
    // Fail if not an array
    if (!Array.isArray(value)) {
      throw AttributeError.fromCode('attr.validation.notArray', this)
    }
    
    
    // Validate each element
    let errors = [ ]
    value.forEach((elem, i) => {
      try {
        this.ClusterType.validateValuesAgainstSchema(elem)
      }
      catch (error) {
        errors = errors.concat(error.subErrors.map(e => {
          e.message = `${this.fullName}[${i}]: ${e.message}`
          return e
        }))
      }
    })
    
    if (errors.length > 0) {
      throw AttributeError.composite(errors)
    }
  }
  
}
