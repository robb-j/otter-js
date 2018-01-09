const { usesTrait } = require('../utils')

/** @type QueryExpression */
module.exports = function has(value, attr) {
  
  if (!usesTrait(attr, 'AssociativeType')) return false
  let Cluster = attr.associatedCluster()
  if (attr.associationCategory() !== 'one' || !Cluster) return false
  if (typeof value !== 'object') return false
  
  let exprs = value
  
  for (let key in exprs) {
    exprs[key] = this.validateExpr(exprs[key], Cluster.schema[key])
    if (!exprs[key]) return false
  }
  return true
}

module.exports.precedence = 21
