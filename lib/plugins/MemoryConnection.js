const MemoryAdapter = require('../adapters/MemoryAdapter')

/**
 * An Otter plugin to connect to an in-memory database (used for testing).
 * The second arguement to Otter.use is passed to the MemoryAdapter as configuration
 */
module.exports = {
  install(Otter, options) {
    Otter.addAdapter(new MemoryAdapter(options))
  }
}
