const expect = require('chai').expect
const Adapter = require('../../lib/Adapter')
const Otter = require('../../lib/Otter')


describe('Adapter', function() {
  
  let testAdapter
  
  beforeEach(function() {
    testAdapter = new Adapter()
  })
  
  describe('#constructor', function() {
    it('should set default name', function() {
      expect(testAdapter.name).to.equal('default')
    })
    it('should use the name in options', function() {
      testAdapter = new Adapter({ name: 'fancyAdapter' })
      expect(testAdapter.name).to.equal('fancyAdapter')
    })
    it('should store the options', function() {
      let options = {}
      testAdapter = new Adapter(options)
      expect(testAdapter.options).to.deep.equal(options)
    })
    it('should setup a store for models', function() {
      expect(testAdapter.models).to.exist
    })
    it('should setup a store for processors', function() {
      expect(testAdapter.processors).to.exist
    })
  })
  
  describe('#supportsAttribute', function() {
    it('should default to false', function() {
      expect(testAdapter.supportsAttribute('String')).to.equal(false)
    })
  })
  
  describe('#baseAttributes', function() {
    it('should return an empty object', async function() {
      let base = testAdapter.baseAttributes()
      expect(base).to.deep.equal({})
    })
  })
  
  describe('#setup', function() {
    it('should return a promise', function() {
      expect(testAdapter.setup()).to.be.instanceOf(Promise)
    })
  })
  
  describe('#teardown', function() {
    it('should return a promise', function() {
      let testAdapter = new Adapter()
      expect(testAdapter.teardown()).to.be.instanceOf(Promise)
    })
  })
  
  describe('#addProcessor', function() {
    it('should store the processor under the type', function() {
      testAdapter.addProcessor('where', (k, a, v) => { })
      expect(testAdapter.processors.where).to.exist
      expect(testAdapter.processors.where).to.have.lengthOf(1)
    })
    it('should fail if not a function', function() {
      let callingAdd = () => {
        testAdapter.addProcessor('where', 'not a function')
      }
      expect(callingAdd).to.throw(/Invalid Processor/)
    })
    it('should add new keys if not present', function() {
      testAdapter.addProcessor('extra', (k, v, a) => { })
      expect(testAdapter.processors.extra).to.exist
      expect(testAdapter.processors.extra).to.have.lengthOf(1)
    })
    it('should return itself for chaining', function() {
      let value = testAdapter.addProcessor('extra', (k, v, a) => { })
      expect(value).to.equal(testAdapter)
    })
  })
  
  describe('#makeQuery', function() {
    it('should return a query', function() {
      let q = testAdapter.makeQuery('TestModel')
      expect(q).to.be.instanceOf(Otter.Types.Query)
    })
    it('should return a query instance if passed one', function() {
      let query = new Otter.Types.Query()
      let result = testAdapter.makeQuery('TestModel', query)
      expect(result).to.equal(query)
    })
    it('should set the options on the query', function() {
      let query = testAdapter.makeQuery('TestModel', '77', { limit: 7 })
      expect(query.limit).to.equal(7)
    })
  })
  
  describe('(validation)', function() {
    
    let testAdapter
    
    class FailingAttr extends Otter.Types.Attribute {
      validateModelValue(value) { throw new Error('Attribute is invalid') }
    }
    class ModelA extends Otter.Types.Model {
      static attributes() { return { name: String } }
    }
    class ModelB extends Otter.Types.Model {
      static attributes() { return { name: 'FailingAttr' } }
    }
    class TestAdapter extends Otter.Types.Adapter {
      supportsAttribute() { return true }
    }
    
    beforeEach(async function() {
      testAdapter = new TestAdapter()
      await Otter.extend().use((o) => {
        o.addModel(ModelA)
        o.addModel(ModelB)
        o.addAdapter(testAdapter)
        o.addAttribute(FailingAttr)
      }).start()
    })
  
    describe('#validateModelQuery', function() {
      it('should pass', function() {
        let query = new Otter.Types.Query('ModelA')
        testAdapter.validateModelQuery(query)
      })
      it('should fail with invalid models', function() {
        let query = new Otter.Types.Query('BadModel')
        let callingValidate = () => {
          testAdapter.validateModelQuery(query)
        }
        expect(callingValidate).to.throw(/unknown Model/)
      })
      it('should fail with unknown where attributes', function() {
        
        let query = new Otter.Types.Query('ModelA', { age: 5 })
        let callingValidate = () => {
          testAdapter.validateModelQuery(query)
        }
        expect(callingValidate).to.throw(/unknown Attribute/)
      })
    })
    
    describe('#validateModelValues', function() {
      it('should pass', function() {
        testAdapter.validateModelValues('ModelA', { name: 'Terrance' })
      })
      it('should fail without values', function() {
        let callingValidate = () => {
          testAdapter.validateModelValues('ModelA')
        }
        expect(callingValidate).to.throw(/without values/)
      })
      it('should fail with invalid models', function() {
        let callingValidate = () => {
          testAdapter.validateModelValues('BadModel', {})
        }
        expect(callingValidate).to.throw(/unknown Model/)
      })
      it('should fail if attribute fails', function() {
        let callingValidate = () => {
          testAdapter.validateModelValues('ModelB', { name: 'Terrance' })
        }
        expect(callingValidate).to.throw(/Attribute is invalid/)
      })
      it('should fail for unknown values', function() {
        let callingValidate = () => {
          testAdapter.validateModelValues('ModelA', { age: 7 })
        }
        expect(callingValidate).to.throw(/unknown Attribute/)
      })
    })
  })
})
