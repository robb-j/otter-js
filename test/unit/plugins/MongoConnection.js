const expect = require('chai').expect
const Otter = require('../../../lib')
const MongoAdapter = require('../../../lib/adapters/MongoAdapter')

describe('MemoryConnection', function() {
  
  it('should add a MemoryAdapter', function() {
    let TestOtter = Otter.extend()
    TestOtter.use(Otter.Plugins.MongoConnection, { url: 'mongodb:localhost' })
    expect(TestOtter.active.adapters.default).is.instanceOf(MongoAdapter)
  })
  
})
