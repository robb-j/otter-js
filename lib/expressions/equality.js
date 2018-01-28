
/** @type QueryExpression  */
module.exports = function(value, attr) {
  return attr.valueMatchesType(value) || (!attr.isRequired && value === null)
}

module.exports.precedence = 0
