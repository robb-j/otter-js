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
    it('should format class and attribute name', function() {
      let attr = new Otter.Types.Attribute('myAttr', 'MyModel')
      assert.equal(attr.fullName, 'MyModel.myAttr')
    })
  })
  
  
  describe('#valueType', function() {
    it('should default to null', function() {
      let attr = new Otter.Types.Attribute('myAttr', 'MyModel')
      assert.equal(attr.valueType, null)
    })
  })
  
  
  describe('#installOn', function() {
    
    let model, values, attr
    
    beforeEach(function() {
      values = { age: 7 }
      model = { values }
      attr = new Otter.Types.Attribute('age', 'MyModel')
    })
    
    it('should add a getter', function() {
      attr.installOn(model)
      assert.equal(model.age, 7)
    })
    
    it('should add a setter', function() {
      attr.installOn(model)
      model.age = 42
      assert.equal(model.age, 42)
    })
    
    it('should add an enumerable value', function() {
      attr.installOn(model)
      let vals = Object.keys(model)
      assert(vals.includes('age'))
    })
    
    it('should set default value', function() {
      let defaultAttr = new Otter.Types.Attribute('name', 'MyModel', { default: 21 })
      let model = { values: {} }
      defaultAttr.installOn(model)
      assert.equal(model.name, 21)
    })
    
    it('should set default value via function', function() {
      let options = { default() { return 7 + 2 } }
      let defaultAttr = new Otter.Types.Attribute('name', 'MyModel', options)
      let model = { values: {} }
      defaultAttr.installOn(model)
      assert.equal(model.name, 9)
    })
    
    it('should set value to null if no default', function() {
      let model = { values: {} }
      attr.installOn(model)
      assert(model.age === null)
    })
    
  })
  
  
})
