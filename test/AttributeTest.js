const expect = require('chai').expect
const assert = require('assert')
const Otter = require('../lib/Otter')


class TestAttribute extends Otter.Types.Attribute {
  get valueType() { return 'string' }
}


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
    
    it('should store enum options', function() {
      let attr = new TestAttribute('myAttr', 'MyModel', {
        enum: [ 'A', 'B', 'C' ]
      })
      assert.deepEqual(attr.enumOptions, [ 'A', 'B', 'C' ])
    })
    
    it('should store validator', function() {
      let attr = new TestAttribute('myAttr', 'MyModel', {
        validator() {}
      })
      assert.equal(typeof attr.validator, 'function')
    })
    
    it('should fail if protect is not a boolean', function() {
      assert.throws(() => {
        let attr = new TestAttribute('myAttr', 'MyModel', {
          protect: 'not a bool'
        })
      }, /'protect' must be a Boolean/)
    })
    
    it('should fail if required is not a boolean', function() {
      assert.throws(() => {
        let attr = new TestAttribute('myAttr', 'MyModel', {
          required: 'not a bool'
        })
      }, /'required' must be a Boolean/)
    })
  })
  
  
  describe('#validateSelf', function() {
    
    it('should exist', function() {
      let attr = new Otter.Types.Attribute('myAttr')
      assert(attr.validateSelf)
    })
    
    it('should not throw by default', function() {
      let attr = new Otter.Types.Attribute('myAttr')
      assert.doesNotThrow(() => {
        attr.validateSelf()
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
  
  
  describe('#isProtected', function() {
    it('should be true if set', function() {
      let attr = new Otter.Types.Attribute('myAttr', 'MyModel', {
        protect: true
      })
      assert.equal(attr.isProtected, true)
    })
  })
  
  
  describe('#isRequired', function() {
    it('should be true if set', function() {
      let attr = new Otter.Types.Attribute('myAttr', 'MyModel', {
        required: true
      })
      assert.equal(attr.isRequired, true)
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
  
  
  describe('#processEnumOption', function() {
    
    let attr
    
    beforeEach(function() {
      attr = new TestAttribute('myAttr', 'TestModel')
    })
    
    it('return raw values', function() {
      let processed = attr.processEnumOption(['A', 'B', 'C'])
      assert.deepEqual(processed, ['A', 'B', 'C'])
    })
    
    it('should process enum function', function() {
      let processed = attr.processEnumOption(function() {
        return [ 'A', 'B', 'C' ]
      })
      assert.deepEqual(processed, [ 'A', 'B', 'C' ])
    })
    
    it('default to null', function() {
      let processed = attr.processEnumOption()
      assert.strictEqual(processed, null)
    })
    
    it('should fail if not an array', function() {
      assert.throws(() => {
        let processed = attr.processEnumOption('hello')
      }, /Invalid enum/)
    })
    
    it('should fail if values are wrong type', function() {
      assert.throws(() => {
        let processed = attr.processEnumOption([
          'A', 'B', 7
        ])
      }, /Invalid enum values/)
    })
  })
  
  
  describe('#processValidatorOption', function() {
    
    let attr
    
    beforeEach(function() {
      attr = new TestAttribute('myAttr', 'TestModel')
    })
    
    it('should default to null', function() {
      let processed = attr.processValidatorOption()
      assert.strictEqual(processed, null)
    })
    
    it('should fail if not a function', function() {
      assert.throws(() => {
        attr.processValidatorOption('no a function')
      }, /Invalid validator/)
    })
    
    it('should return a function', function() {
      let processed = attr.processValidatorOption(function() {})
      assert.equal(typeof processed, 'function')
    })
    
    it('should rebind this to the attribute', function() {
      let boundThis = null
      let processed = attr.processValidatorOption(function() {
        boundThis = this
      })
      processed()
      assert.equal(boundThis, attr)
    })
  })
  
  
})
