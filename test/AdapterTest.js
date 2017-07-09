const assert = require('assert')
const assExt = require('./assertExtension')
const Adapter = require('../lib/Adapter')
const Otter = require('../lib/Otter')


describe('Adapter', function() {
  
  let testAdapter
  
  beforeEach(function() {
    testAdapter = new Adapter()
  })
  
  describe('#constructor', function() {
    it('should set default name', function() {
      assert.equal(testAdapter.name, 'default')
    })
    it('should use the name in options', function() {
      testAdapter = new Adapter({ name: 'fancyAdapter' })
      assert.equal(testAdapter.name, 'fancyAdapter')
    })
    it('should store the options', function() {
      let options = {}
      testAdapter = new Adapter(options)
      assert.equal(testAdapter.options, options)
    })
    it('should setup a store for models', function() {
      assert(testAdapter.models)
    })
    it('should setup a store for processors', function() {
      assert(testAdapter.processors)
    })
  })
  
  describe('#supportsAttribute', function() {
    it('should default to false', function() {
      assert(!testAdapter.supportsAttribute('String'))
    })
  })
  
  describe('#setup', function() {
    it('should return a promise', function() {
      assExt.assertClass(testAdapter.setup(), 'Promise')
    })
  })
  
  describe('#teardown', function() {
    it('should return a promise', function() {
      let testAdapter = new Adapter()
      assExt.assertClass(testAdapter.teardown(), 'Promise')
    })
  })
  
  describe('#addProcessor', function() {
    it('should store the processor under the type', function() {
      testAdapter.addProcessor('where', (k, a, v) => { })
      assert(testAdapter.processors.where)
      assert.equal(testAdapter.processors.where.length, 1)
    })
    it('should fail if not a function', function() {
      assert.throws(() => {
        testAdapter.addProcessor('where', 'not a function')
      }, /Invalid Processor/)
    })
    it('should add new keys if not present', function() {
      testAdapter.addProcessor('extra', (k, v, a) => { })
      assert(testAdapter.processors.extra)
      assert.equal(testAdapter.processors.extra.length, 1)
    })
    it('should return itself for chaining', function() {
      let rtn = testAdapter.addProcessor('extra', (k, v, a) => { })
      assert.equal(rtn, testAdapter)
    })
  })
  
  describe('#makeQuery', function() {
    it('should return a query', function() {
      let q = testAdapter.makeQuery('TestModel')
      assExt.assertClass(q, 'Query')
    })
    it('should return a query instance if passed one', function() {
      let q = new Otter.Types.Query()
      let result = testAdapter.makeQuery('TestModel', q)
      assert.equal(result, q)
    })
  })
  
  describe('(validation)', function() {
    
    let testAdapter, TestOtter
    
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
      TestOtter = await Otter.extend().use((o) => {
        o.addModel(ModelA)
        o.addModel(ModelB)
        o.addAdapter(testAdapter)
        o.addAttribute(FailingAttr)
      }).start()
    })
  
    describe('#validateModelQuery', function() {
      it('should exist', function() {
        assert.equal(typeof testAdapter.validateModelQuery, 'function')
      })
      it('should pass', function() {
        let q = new Otter.Types.Query('ModelA')
        assert.doesNotThrow(() => {
          testAdapter.validateModelQuery(q)
        })
      })
      it('should fail with invalid models', function() {
        let q = new Otter.Types.Query('BadModel')
        assert.throws(() => {
          testAdapter.validateModelQuery(q)
        }, /unknown Model/)
      })
      it('should fail with unknown where attributes', function() {
        let q = new Otter.Types.Query('ModelA', { age: 5 })
        assert.throws(() => {
          testAdapter.validateModelQuery(q)
        }, /unknown Attribute/)
      })
    })
    
    describe('#validateModelValues', function() {
      it('should exist', function() {
        assert.equal(typeof testAdapter.validateModelValues, 'function')
      })
      it('should pass', function() {
        assert.doesNotThrow(() => {
          testAdapter.validateModelValues('ModelA', { name: 'Terrance' })
        })
      })
      it('should fail without values', function() {
        assert.throws(() => {
          testAdapter.validateModelValues('ModelA')
        }, /without values/)
      })
      it('should fail with invalid models', function() {
        assert.throws(() => {
          testAdapter.validateModelValues('BadModel', {})
        }, /unknown Model/)
      })
      it('should fail if attribute fails', function() {
        assert.throws(() => {
          testAdapter.validateModelValues('ModelB', { name: 'Terrance' })
        }, /Attribute is invalid/)
      })
      it('should fail for unknown values', function() {
        assert.throws(() => {
          testAdapter.validateModelValues('ModelA', { age: 7 })
        }, /unknown Attribute/)
      })
    })
  })
})
