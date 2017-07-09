
module.exports = function(value, expr) {
  return value !== (expr['!'] || expr['not'])
}
