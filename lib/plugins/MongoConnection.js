const MongoAdapter = require('../adapters/MongoAdapter')

/**
 * An Otter plugin to connect to a mongo database
 * The second arguement for Otter.use is passed to MongoAdapter as configuration
 */
module.exports = {
  install(Otter, options) {
    Otter.addAdapter(new MongoAdapter(options))
  }
}
