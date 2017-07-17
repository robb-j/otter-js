/** @type MongoExprProcessor  */
module.exports = function(attr, expr) {
  return { [attr.name]: expr }
}
