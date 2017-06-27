const assert = require('assert')
const assExt = require('./assertExtension')
const Adapter = require('../lib/Adapter')


describe('Adapter', function() {
  
  // let testAdapter
  
  beforeEach(function() {
    
  })
  
  describe('#constructor', function() {
    
    it('should set default name', function() {
      let testAdapter = new Adapter()
      assert.equal(testAdapter.name, 'default')
    })
    
    it('should use the name in options', function() {
      let testAdapter = new Adapter({ name: 'fancyAdapter' })
      assert.equal(testAdapter.name, 'fancyAdapter')
    })
    
    it('should store the options', function() {
      let options = {}
      let testAdapter = new Adapter(options)
      assert.equal(testAdapter.options, options)
    })
    
    it('should setup a store for models', function() {
      let testAdapter = new Adapter()
      assert(testAdapter.models)
    })
  })
  
  
  describe('#supportsAttribute', function() {
    
    it('should default to false', function() {
      let testAdapter = new Adapter()
      assert(!testAdapter.supportsAttribute('String'))
    })
  })
  
  
  describe('#setup', function() {
    
    it('should return a promise', function() {
      let testAdapter = new Adapter()
      assExt.assertClass(testAdapter.setup(), 'Promise')
    })
  })
  
  
  describe('#teardown', function() {
    
    it('should return a promise', function() {
      let testAdapter = new Adapter()
      assExt.assertClass(testAdapter.teardown(), 'Promise')
    })
  })
  
  
})
