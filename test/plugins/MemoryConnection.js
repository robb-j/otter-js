const assert = require('assert')
const assExt = require('../assertExtension')
const MemoryConnection = require('../../lib/plugins/MemoryConnection')
const Otter = require('../../lib/Otter')

describe('MemoryConnection', function() {
  
  it('should add a MemoryAdapter', function() {
    let TestOtter = Otter.extend()
    TestOtter.use(MemoryConnection)
    assExt.assertClass(TestOtter.active.adapters.default, 'MemoryAdapter')
  })
  
  
  it('should store it under its name', function() {
    let TestOtter = Otter.extend()
    TestOtter.use(MemoryConnection, { name: 'mem' })
    assExt.assertClass(TestOtter.active.adapters.mem, 'MemoryAdapter')
  })
  
})
