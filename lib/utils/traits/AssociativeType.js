
/**
 * An Attribute Trait that somehow relates to another model
 */
module.exports = (Type) => class AssociativeType extends Type {
  
  /**
   * The cluster type the attribute is related to
   * @return {Otter.Types.Cluster}
   */
  associatedCluster() {
    return null
  }
}
