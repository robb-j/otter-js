const Otter = require('../../lib/Otter')

module.exports = function makeModel(name, attributes) {
  
  // Wrap in an object to give the "class" (function) a dynamic name
  return {
    [name]: class extends Otter.Types.Model {
      static attributes() { return attributes }
    }
  }[name]
}
