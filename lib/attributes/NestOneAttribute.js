// const NestingType = require('../utils/NestinGType')
const Attribute = require('../Attribute')
const AttributeError = require('../errors/AttributeError')
const { undefOrNull } = require('../utils')


module.exports = class NestOneAttribute extends Attribute {
  
  static customNameMap() {
    return { nestOne: 'cluster' }
  }
  
  get valueType() { return 'object' }
  
  get ClusterType() { return this.options.ClusterType }
  
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
    
    
    Object.defineProperty(model, name, {
      enumerable: true,
      configurable: false,
      writable: false,
      value: new ClusterType(model.values[name])
    })
    
  }
  
}