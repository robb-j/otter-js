const expect = require('chai').expect
const Otter = require('../../lib/Otter')


class TestAttribute extends Otter.Types.Attribute {
  get valueType() { return 'string' }
}


describe('Attribute', function() {
  
  describe('#constructor', function() {
    
    it('should store the options', function() {
      let opts = {}
      let attr = new Otter.Types.Attribute(null, null, opts)
      expect(attr.options).to.equal(opts)
    })
    
    it('should store its name', function() {
      let attr = new Otter.Types.Attribute('myAttr')
      expect(attr.name).to.equal('myAttr')
    })
    
    it('should store its model name', function() {
      let attr = new Otter.Types.Attribute(null, 'MyModel')
      expect(attr.modelName).to.equal('MyModel')
    })
    
    it('should set default options', function() {
      let attr = new Otter.Types.Attribute('myAttr')
      expect(attr.options).to.exist
    })
    
    it('should store enum options', function() {
      let attr = new TestAttribute('myAttr', 'MyModel', {
        enum: [ 'A', 'B', 'C' ]
      })
      expect(attr.enumOptions).to.deep.equal([ 'A', 'B', 'C' ])
    })
    
    it('should store validator', function() {
      let attr = new TestAttribute('myAttr', 'MyModel', {
        validator() {}
      })
      expect(attr.validator).to.be.a('function')
    })
    
    it('should fail if protect is not a boolean', function() {
      /* eslint-disable no-new */
      let creatingAttribute = () => {
        new TestAttribute('myAttr', 'MyModel', {
          protect: 'not a bool'
        })
      }
      expect(creatingAttribute).to.throw(/'protect' must be a Boolean/)
    })
    
    it('should fail if required is not a boolean', function() {
      /* eslint-disable no-new */
      let creatingAttribute = () => {
        let options = { required: 'not a bool' }
        new TestAttribute('myAttr', 'MyModel', options)
      }
      expect(creatingAttribute).to.throw(/'required' must be a Boolean/)
    })
  })
  
  
  describe('#validateSelf', function() {
    
    it('should exist', function() {
      let attr = new Otter.Types.Attribute('myAttr')
      expect(attr.validateSelf).to.exist
    })
    
    it('should not throw by default', function() {
      let attr = new Otter.Types.Attribute('myAttr')
      attr.validateSelf()
    })
  })
  
  
  describe('#fullName', function() {
    it('should format class and attribute name', function() {
      let attr = new Otter.Types.Attribute('myAttr', 'MyModel')
      expect(attr.fullName).to.equal('MyModel.myAttr')
    })
  })
  
  
  describe('#valueType', function() {
    it('should default to null', function() {
      let attr = new Otter.Types.Attribute('myAttr', 'MyModel')
      expect(attr.valueType).to.equal(null)
    })
  })
  
  
  describe('#isProtected', function() {
    it('should be true if set', function() {
      let options = { protect: true }
      let attr = new Otter.Types.Attribute('myAttr', 'MyModel', options)
      expect(attr.isProtected).to.equal(true)
    })
  })
  
  
  describe('#isRequired', function() {
    it('should be true if set', function() {
      let options = { required: true }
      let attr = new Otter.Types.Attribute('myAttr', 'MyModel', options)
      expect(attr.isRequired).to.equal(true)
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
      expect(model.age).to.equal(7)
    })
    
    it('should add a setter', function() {
      attr.installOn(model)
      model.age = 42
      expect(model.age).to.equal(42)
    })
    
    it('should add an enumerable value', function() {
      attr.installOn(model)
      let vals = Object.keys(model)
      expect(vals).to.include('age')
    })
    
    it('should set default value', function() {
      let defaultAttr = new Otter.Types.Attribute('name', 'MyModel', { default: 21 })
      let model = { values: {} }
      defaultAttr.installOn(model)
      expect(model.name).to.equal(21)
    })
    
    it('should set default value via function', function() {
      let options = { default() { return 7 + 2 } }
      let defaultAttr = new Otter.Types.Attribute('name', 'MyModel', options)
      let model = { values: {} }
      defaultAttr.installOn(model)
      expect(model.name).to.equal(9)
    })
    
    it('should set value to null if no default', function() {
      let model = { values: {} }
      attr.installOn(model)
      expect(model.age).to.equal(null)
    })
  })
  
  
  describe('#valueMatchesType', function() {
    
    it('should compare the type', async function() {
      let attr = new TestAttribute()
      expect(attr.valueMatchesType('something')).to.equal(true)
    })
  })
  
  
  describe('#processEnumOption', function() {
    
    let attr
    beforeEach(function() {
      attr = new TestAttribute('myAttr', 'TestModel')
    })
    
    it('return raw values', function() {
      let processed = attr.processEnumOption(['A', 'B', 'C'])
      expect(processed).to.deep.equal([ 'A', 'B', 'C' ])
    })
    
    it('should process enum function', function() {
      let processed = attr.processEnumOption(function() {
        return [ 'A', 'B', 'C' ]
      })
      expect(processed).to.deep.equal([ 'A', 'B', 'C' ])
    })
    
    it('default to null', function() {
      let processed = attr.processEnumOption()
      expect(processed).to.equal(null)
    })
    
    it('should fail if not an array', function() {
      let callingProcess = () => {
        attr.processEnumOption('hello')
      }
      expect(callingProcess).to.throw(/Invalid enum/)
    })
    
    it('should fail if values are wrong type', function() {
      let callingProcess = () => {
        attr.processEnumOption([ 'A', 'B', 7 ])
      }
      expect(callingProcess).to.throw(/Invalid enum values/)
    })
  })
  
  
  describe('#processValidatorOption', function() {
    
    let attr
    beforeEach(function() {
      attr = new TestAttribute('myAttr', 'TestModel')
    })
    
    it('should default to null', function() {
      let processed = attr.processValidatorOption()
      expect(processed).to.equal(null)
    })
    
    it('should fail if not a function', function() {
      let callingProcess = () => {
        attr.processValidatorOption('no a function')
      }
      expect(callingProcess).to.throw(/Invalid validator/)
    })
    
    it('should return a function', function() {
      let processed = attr.processValidatorOption(function() {})
      expect(processed).to.be.a('function')
    })
    
    it('should rebind this to the attribute', function() {
      let boundThis = null
      let processed = attr.processValidatorOption(function() {
        boundThis = this
      })
      processed()
      expect(boundThis).to.equal(attr)
    })
  })
  
  
})
