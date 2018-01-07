
/** @type QueryExpression  */
module.exports = function(value, attr) {
  return attr.valueType === 'string' && value instanceof RegExp
}

module.exports.precedence = 1
