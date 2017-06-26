
const { collectObjectProperty } = require('./utils')



module.exports = class Model {
  
  static attributes() {
    return { id: String, createdAt: Date, updatedAt: Date }
  }
  
  static collectAttributes() {
    return collectObjectProperty(this, 'attributes')
  }
  
}
