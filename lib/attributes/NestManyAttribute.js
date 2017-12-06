const Attribute = require('../Attribute')
const AttributeError = require('../errors/AttributeError')
const { undefOrNull, isArrayOfType } = require('../utils')


module.exports = class NestManyAttribute extends Attribute {
  
  static customNameMap() {
    return { nestMany: 'cluster' }
  }
  
  get valueType() { return 'object' }
  
  get ClusterType() { return this.options.ClusterType }
  
  get enumOptions() { return null }
  
  
  // valueMatchesType(value) {
  //   return isArrayOfType(this.ClusterType, value)
  // }
  
  // prepareValueForQuery(value) {
  // }
  
  
  validateSelf(Otter, ModelType) {
    
    if (undefOrNull(this.options.cluster)) {
      throw AttributeError.fromCode('attr.nesting.missingCluster', this)
    }
    
    let ClusterType = Otter.active.clusters[this.options.cluster]
    
    if (!ClusterType || ClusterType.adapter !== ModelType.adapter) {
      throw AttributeError.fromCode('attr.nesting.invalidCluster', this, this.options.cluster)
    }
  }
  
  processOptions(Otter, ModelType) {
    this.options.ClusterType = Otter.active.clusters[this.options.cluster]
  }
  
  installOn(model) {
    
    let name = this.name
    let ClusterType = this.ClusterType
    
    if (!model.values[name]) { model.values[name] = [] }
    
    Object.defineProperty(model, name, {
      enumerable: true,
      configurable: false,
      get() { return Array.from(model.values[name]) },
      set(newValue) {
        
        // Skip for invalid arrays
        if (!isArrayOfType(this.ClusterType, newValue)) return
        
        // Assign a shallow copy
        model.values[name] = Array.from(newValue)
      }
    })
    
  }
}
