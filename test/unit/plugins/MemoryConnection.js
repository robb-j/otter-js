const expect = require('chai').expect
const Otter = require('../../../lib/Otter')
const MemoryAdapter = require('../../../lib/adapters/MemoryAdapter')

describe('MemoryConnection', function() {
  
  it('should add a MemoryAdapter', function() {
    let TestOtter = Otter.extend()
    TestOtter.use(Otter.Plugins.MemoryConnection)
    expect(TestOtter.active.adapters.default).to.be.instanceof(MemoryAdapter)
  })
  
  
  it('should store it under its name', function() {
    let TestOtter = Otter.extend()
    TestOtter.use(Otter.Plugins.MemoryConnection, { name: 'mem' })
    expect(TestOtter.active.adapters.mem).to.be.instanceof(MemoryAdapter)
  })
  
})
