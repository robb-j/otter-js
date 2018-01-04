
/**
 * An Attribute Trait that somehow relates to another model
 */
module.exports = (Type) => class AssociativeType extends Type {
  
  /**
   * The type the attribute is related to
   * @return {Otter.Types.Cluster}
   */
  associatedType() {
    return null
  }
}
