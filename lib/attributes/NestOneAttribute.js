const Attribute = require('../Attribute')
const { undefOrNull, AddTraits, NestingType, AssociativeType } = require('../utils')


module.exports = class NestOneAttribute extends AddTraits(Attribute, NestingType, AssociativeType) {
  
  static customNameMap() {
    return { nestOne: 'cluster' }
  }
  
  
  
  associatedCluster() { return this.ClusterType }
  
  
  
  validateSelf(Otter, ModelType) {
    
    // Validate the passed cluster
    this.validateOptions(this.options, Otter, ModelType)
  }
  
  processOptions(Otter, ModelType) {
    
    // Store the cluster type
    this.storeClusterType(this.options, Otter)
  }
  
  
  installOn(model) {
    
    // Cache the name and type, this is rebound on properties
    let name = this.name
    let ClusterType = this.ClusterType
    
    
    // The cluster instance
    let cluster = null
    
    
    // Define the value
    Object.defineProperty(model, name, {
      enumerable: true,
      configurable: false,
      get() { return cluster },
      set(newValue) {
        
        if (newValue instanceof ClusterType) {
          cluster = newValue
        }
        else if (undefOrNull(newValue)) {
          cluster = null
        }
        else if (typeof newValue === 'object') {
          cluster = new ClusterType(newValue)
        }
        
        if (!cluster) {
          model.values[name] = null
        }
        else if (model.values[name] !== cluster.values) {
          model.values[name] = cluster.values
        }
      }
    })
    
    
    // Set the initial value
    model[name] = model.values[name]
    
  }
  
  
  validateModelValue(value) {
    
    // Use the base validation
    super.validateModelValue(value)
    
    // Let the ClusterType validate itself with our value
    if (value) {
      this.ClusterType.validateValuesAgainstSchema(value)
    }
    
  }
  
}
