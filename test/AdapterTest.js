const assert = require('assert')
const Adapter = require('../lib/Adapter')


describe('Adapter', function() {
  
  // let testAdapter
  
  beforeEach(function() {
    
  })
  
  describe('#properties', function() {
    
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
  })
  
  
})
