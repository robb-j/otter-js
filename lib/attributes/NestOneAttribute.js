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
    
    let clusterName = this.options.cluster
    
    let ClusterType = Otter.active.clusters[clusterName]
    
    if (!ClusterType || ClusterType.adapter !== ModelType.adapter) {
      throw AttributeError.fromCode('attr.nesting.invalidCluster', this, clusterName)
    }
    
  }
  
  processOptions(Otter, ModelType) {
    this.options.ClusterType = Otter.active.clusters[this.options.cluster]
  }
  
  
  installOn(model) {
    
    let name = this.name
    let ClusterType = this.ClusterType
    
    
    let cluster = null
    
    if (model.values[name]) {
      cluster = new ClusterType(model.values[name])
    }
    
    
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
