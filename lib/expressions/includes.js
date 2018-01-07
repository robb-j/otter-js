const { usesTrait } = require('../utils')

/** @type QueryExpression */
module.exports = function includes(value, attr) {
  
  if (typeof value !== 'object') return false
  if (!usesTrait(attr, 'AssociativeType')) return false
  if (attr.associationCategory() !== 'many') return false
  let Cluster = attr.associatedCluster()
  
  let exprs = value
  
  
  for (let key in exprs) {
    if (!Cluster.schema[key]) return false
    exprs[key] = this.validateExpr(exprs[key], Cluster.schema[key])
    if (!exprs[key]) return false
  }
  
  return true
}

module.exports.precedence = 20
