const expect = require('chai').expect
const assert = require('assert')
const assExt = require('./assertExtension')
const Otter = require('../lib/Otter')

class TestModel extends Otter.Types.Model {}
class TestAttribute extends Otter.Types.Attribute {}


describe('Otter', function() {
  
  let TestOtter = null
  
  beforeEach(function() {
    
    TestOtter = Otter.extend()
  })
  
  
  describe('#extend', function() {
    
    it('should create a new instance', function() {
      let AnotherOtter = TestOtter.extend()
      assert.notEqual(AnotherOtter, TestOtter)
    })
    
    it('should carry across plugins', function() {
      TestOtter.use(() => {})
      let AnotherOtter = TestOtter.extend()
      assert.equal(AnotherOtter.active.plugins.length, 1)
    })
    
    it('should not carry across plugins after extension', function() {
      let AnotherOtter = TestOtter.extend()
      TestOtter.use(() => {})
      assert.equal(AnotherOtter.active.plugins.length, 0)
    })
    
    it('should shallow copy plugins', function() {
      TestOtter.use(() => {})
      let AnotherOtter = TestOtter.extend()
      
      // Check they aren't the same objects
      assert.notEqual(AnotherOtter.active.plugins, TestOtter.active.plugins)
      
      // Check thet have the same objects in
      assert.deepEqual(
        AnotherOtter.active.plugins,
        TestOtter.active.plugins
      )
    })
    
    it('should shallow copy adapters', function() {
      let AnotherOtter = TestOtter.extend()
      assert.notEqual(AnotherOtter.active.adapters, TestOtter.active.adapters)
    })
  })
  
  
  describe('#addAdapter', function() {
    
    it('should store the adapter', function() {
      let adapter = { name: 'myAdapter', setup() {} }
      
      TestOtter.addAdapter(adapter)
      
      assert(TestOtter.active.adapters.myAdapter)
    })
    
    it('should fail if already registered', function() {
      
      let adapter = {
        name: 'myAdapter',
        setup() { }
      }
      
      TestOtter.addAdapter(adapter)
      
      assert.throws(() => {
        TestOtter.addAdapter(adapter)
      }, /Adapter already registered/)
    })
    
    it('should return itself for chaining', function() {
      let adapter = { name: 'myAdapter', setup() {} }
      assert(TestOtter.addAdapter(adapter), TestOtter)
    })
  })
  
  
  describe('#addModel', function() {
    
    it('should store the model', function() {
      TestOtter.addModel(TestModel)
      assert(TestOtter.active.models.TestModel)
    })
    
    it('should fail if already registered', function() {
      
      TestOtter.addModel(TestModel)
      
      assert.throws(() => {
        TestOtter.addModel(TestModel)
      }, /Model already registered/)
    })
    
    it('should return itself for chaining', function() {
      assert(TestOtter.addModel(TestModel), TestOtter)
    })
  })
  
  
  describe('#addAttribute', function() {
    
    it('should store the attribute', function() {
      TestOtter.addAttribute(TestAttribute)
      assert(TestOtter.active.attributes.TestAttribute)
    })
    
    it('should fail if already registered', function() {
      TestOtter.addAttribute(TestAttribute)
      assert.throws(() => {
        TestOtter.addAttribute(TestAttribute)
      }, /Attribute already registered/)
    })
    
    it('should return itself for chaining', function() {
      assert(TestOtter.addAttribute(TestAttribute), TestOtter)
    })
  })
  
  
  describe('#addQueryExpr', function() {
    
    it('should store the expr', function() {
      let expr = (value, type) => { }
      TestOtter.addQueryExpr('myType', expr)
      assert.equal(TestOtter.active.exprs.myType, expr)
    })
    
    it('should fail if not a function', function() {
      assert.throws(() => {
        TestOtter.addQueryExpr('type', 'not an expr')
      }, /Invalid QueryExpr/)
    })
  })
  
  
  describe('#start', function() {
    
    let InvalidAdapterModel
    let ValidModel
    
    beforeEach(function() {
      InvalidAdapterModel = class extends Otter.Types.Model {
        static adapterName() { return 'invalid' }
      }
      
      ValidModel = class extends Otter.Types.Model { }
      
      TestOtter.use(Otter.Plugins.MemoryConnection)
    })
    
    
    it('should return a promise', function() {
      assExt.assertClass(TestOtter.start(), 'Promise')
    })
    
    it('should register default attributes', async function() {
      await TestOtter.start()
      assert(Object.keys(TestOtter.active.attributes).length > 0)
    })
    
    it('should allow custom base attributes', async function() {
      
      // Register a custom string first
      class String extends TestOtter.Types.Attribute { }
      TestOtter.addAttribute(String)
      
      // Start otter
      await TestOtter.start()
      
      // Check our custom string is still registered
      assert.equal(TestOtter.active.attributes.String, String)
    })
    
    it('should fail if model has an invalid adapter', async function() {
      
      TestOtter.addModel(InvalidAdapterModel)
      
      let error = await assExt.getAsyncError(async () => {
        await TestOtter.start()
      })
      
      assert(/Invalid adapterName/.test(error.message))
    })
    
    it('should succeed with a valid model', async function() {
      
      TestOtter.addModel(ValidModel)
      
      try {
        await TestOtter.start()
      }
      catch (error) {
        assert.fail(error.message)
      }
    })
    
    it('should make models active', async function() {
      TestOtter.addModel(ValidModel)
      await TestOtter.start()
      assert(ValidModel.isActive)
    })
    
    it('should put the adapter onto the model', async function() {
      TestOtter.addModel(ValidModel)
      await TestOtter.start()
      assert(ValidModel.adapter)
    })
    
    it('should put the schema onto the model', async function() {
      TestOtter.addModel(ValidModel)
      await TestOtter.start()
      assert(ValidModel.schema)
    })
    
    it('should put the model onto the adapter', async function() {
      TestOtter.addModel(ValidModel)
      await TestOtter.start()
      assert(TestOtter.active.adapters.default.models.ValidModel)
    })
    
    it('should setup adapters', async function() {
      
      // Use a fresh copy of Otter
      let AnotherOtter = Otter.extend()
      
      // Create a custom adapter to log if setup was called
      let instance = null
      class CustomAdapter extends Otter.Types.Adapter {
        async setup(Otter) { instance = Otter }
      }
      
      // Add our custom adapter
      AnotherOtter.addAdapter(new CustomAdapter())
      
      // Start otter
      await AnotherOtter.start()
      
      // Check setup was called and passed the correct instance
      assert.equal(instance, AnotherOtter)
    })
    
    it('should fail if the adapter does not support an attribute', async function() {
      
      // Create a fresh otter
      let AnotherOtter = Otter.extend()
      
      // Add an adapter which doesn't support attributes
      class InvalidAdapter extends Otter.Types.Adapter {
        supportsAttribute(attr) { return false }
      }
      
      // Add our adapter and a model to validte
      AnotherOtter.addAdapter(new InvalidAdapter())
      AnotherOtter.addModel(ValidModel)
      
      
      let error = await assExt.getAsyncError(async () => {
        await AnotherOtter.start()
      })
      
      assert(/does not support/.test(error.message))
    })
    
    it('should fail if an attribute is not valid', async function() {
      
      class Invalid extends Otter.Types.Attribute {
        validateSelf(Otter) { throw new Error('an error') }
      }
      
      class InvalidModel extends Otter.Types.Model {
        static attributes() { return { some: 'Invalid' } }
      }
      
      TestOtter.addAttribute(Invalid)
      TestOtter.addModel(InvalidModel)
      
      
      let error = await assExt.getAsyncError(async () => {
        await TestOtter.start()
      })
      
      assert(/an error/.test(error.message))
    })
    
    it('should fail if no adapters are set', async function() {
      
      let AnotherOtter = Otter.extend()
      
      let error = await assExt.getAsyncError(async () => {
        await AnotherOtter.start()
      })
      
      assert(/No Adapters added/.test(error.message))
    })
    
    it('should return itself for chaining', async function() {
      let rtn = await TestOtter.start()
      assert.equal(rtn, TestOtter)
    })
    
    it('should add exprs to Query', async function() {
      let expr = (value, type) => { }
      TestOtter.addQueryExpr('myType', expr)
      await TestOtter.start()
      assert.equal(Otter.Types.Query.exprs.myType, expr)
    })
    
    it('should register default expressions', async function() {
      await TestOtter.start()
      assert(Object.keys(Otter.Types.Query.exprs).length > 0)
    })
  })
  
})
