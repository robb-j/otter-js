const assert = require('assert')
const Otter = require('../lib/Otter')


describe('Attribute', function() {
  
  
  describe('#constructor', function() {
    
    it('should store the options', function() {
      let opts = {}
      let attr = new Otter.Types.Attribute(null, null, opts)
      assert.equal(attr.options, opts)
    })
    
    it('should store its name', function() {
      let attr = new Otter.Types.Attribute('myAttr')
      assert.equal(attr.name, 'myAttr')
    })
    
    it('should store its model name', function() {
      let attr = new Otter.Types.Attribute(null, 'MyModel')
      assert.equal(attr.modelName, 'MyModel')
    })
    
    it('should set default options', function() {
      let attr = new Otter.Types.Attribute('myAttr')
      assert(attr.options)
    })
  })
  
  
  describe('#validate', function() {
    
    it('should exist', function() {
      let attr = new Otter.Types.Attribute('myAttr')
      assert(attr.validate)
    })
    
    it('should not throw by default', function() {
      let attr = new Otter.Types.Attribute('myAttr')
      assert.doesNotThrow(() => {
        attr.validate()
      })
    })
  })
  
  
  describe('#fullName', function() {
    let attr = new Otter.Types.Attribute('myAttr', 'MyModel')
    assert.equal(attr.fullName, 'MyModel.myAttr')
  })
  
  
  describe('#valueType', function() {
    let attr = new Otter.Types.Attribute('myAttr', 'MyModel')
    assert.equal(attr.valueType, null)
  })
  
  
})
