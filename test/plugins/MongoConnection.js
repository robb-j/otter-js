const assert = require('assert')
const assExt = require('../assertExtension')
const Otter = require('../../lib/Otter')

describe('MemoryConnection', function() {
  
  it('should add a MemoryAdapter', function() {
    let TestOtter = Otter.extend()
    TestOtter.use(Otter.Plugins.MongoConnection, { url: 'mongodb:localhost' })
    assExt.assertClass(TestOtter.active.adapters.default, 'MongoAdapter')
  })
  
})
