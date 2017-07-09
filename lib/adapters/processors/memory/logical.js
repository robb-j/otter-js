
module.exports = function(value, expr) {
  
  if (expr['and']) {
    
    return expr['and'].reduce((pass, subExpr) => {
      return pass && this.evaluateExpr(subExpr, value)
    }, true)
  }
  if (expr['or']) {
    
    return expr['or'].reduce((pass, subExpr) => {
      return pass || this.evaluateExpr(subExpr, value)
    }, true)
    
  }
  
  return false
}
