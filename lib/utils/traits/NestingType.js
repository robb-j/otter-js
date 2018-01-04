const undefOrNull = require('../undefOrNull')
const AttributeError = require('../../errors/AttributeError')

/**
 * A Trait for Attributes which nest a Cluster
 */
module.exports = (Type) => class NestingType extends Type {
  
  get valueType() { return 'object' }
  
  get ClusterType() { return this.options.ClusterType }
  
  get enumOptions() { return null }
  
  
  validateOptions(options, Otter, ModelType) {
    
    if (undefOrNull(options.cluster)) {
      throw AttributeError.fromCode('attr.nesting.missingCluster', this)
    }
    
    let ClusterType = Otter.active.clusters[this.options.cluster]
    
    if (!ClusterType || ClusterType.adapter !== ModelType.adapter) {
      throw AttributeError.fromCode('attr.nesting.invalidCluster', this, this.options.cluster)
    }
  }
  
  storeClusterType(options, Otter) {
    this.options.ClusterType = Otter.active.clusters[this.options.cluster]
  }
  
}
