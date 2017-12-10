const Attribute = require('../Attribute')
const AttributeError = require('../errors/AttributeError')
const { undefOrNull } = require('../utils')


module.exports = class NestOneAttribute extends Attribute {
  
  static customNameMap() {
    return { nestOne: 'cluster' }
  }
  
  get valueType() { return 'object' }
  
  get ClusterType() { return this.options.ClusterType }
  
  get enumOptions() { return null /* Don't allow enums */ }
  
  
  // valueMatchesType(value) {
  // }
  
  // prepareValueForQuery(value) {
  // }
  
  validateSelf(Otter, ModelType) {
    
    // Ensure we have a cluster
    if (undefOrNull(this.options.cluster)) {
      throw AttributeError.fromCode('attr.nesting.missingCluster', this)
    }
    
    // Use the name to get the cluster type
    let ClusterType = Otter.active.clusters[this.options.cluster]
    
    // Check the type exists & is on the same adapter
    if (!ClusterType || ClusterType.adapter !== ModelType.adapter) {
      throw AttributeError.fromCode('attr.nesting.invalidCluster', this, this.options.cluster)
    }
    
  }
  
  processOptions(Otter, ModelType) {
    
    // Store the cluster type for later use
    this.options.ClusterType = Otter.active.clusters[this.options.cluster]
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
    // if (model.values[name]) {
    model[name] = model.values[name]
    // }
    
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
