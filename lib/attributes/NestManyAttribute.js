const Attribute = require('../Attribute')
const AttributeError = require('../errors/AttributeError')
const { undefOrNull } = require('../utils')


module.exports = class NestManyAttribute extends Attribute {
  
  static customNameMap() {
    return { nestMany: 'cluster' }
  }
  
  get valueType() { return 'object' }
  
  get ClusterType() { return this.options.ClusterType }
  
  get enumOptions() { return null }
  
  
  // valueMatchesType(value) {
  //   return Array.isArray(value) && value.every(v => v instanceof this.ClusterType)
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
    
    class ClusterArray extends Array {
      push(...elems) {
        if (elems.every(v => v instanceof ClusterType)) {
          model.values[name].push(...elems)
        }
        else {
          model.values[name].push(...(elems.map(vals => new ClusterType(vals))))
        }
      }
    }
    
    Object.defineProperty(model, name, {
      enumerable: true,
      configurable: false,
      get() { return ClusterArray.from(model.values[name]) },
      set(newValue) {
        
        // Skip if not an Array
        if (!Array.isArray(newValue)) { return }
        
        // If not an array of ClusterTypes, attempt to process into them
        if (!newValue.every(v => v instanceof ClusterType)) {
          if (!newValue.every(v => typeof v === 'object')) return
          newValue = newValue.map(obj => new ClusterType(obj))
        }
        
        // Assign a shallow copy
        model.values[name] = newValue
      }
    })
    
  }
}
