
const Otter = require('../Otter')
const MemoryAdapter = require('../adapters/MemoryAdapter')

module.exports = {
  install(Otter, options) {
    
    Otter.addAdapter(new MemoryAdapter(options))
  }
}
