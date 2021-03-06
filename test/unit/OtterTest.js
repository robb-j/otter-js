const expect = require('chai').expect
const Otter = require('../../lib')

class TestAttribute extends Otter.Types.Attribute {}

const { asyncError, makeModel, makeCluster } = require('../utils')

function startupError(Otter) {
  return asyncError(() => Otter.start())
}


describe('Otter', function() {
  
  let TestOtter, TestModel, TestCluster
  beforeEach(function() {
    TestOtter = Otter.extend()
    TestModel = makeModel('TestModel', { })
    TestCluster = makeCluster('TestCluster', { })
  })
  
  describe('#extend', function() {
    
    it('should create a new instance', async function() {
      let AnotherOtter = TestOtter.extend()
      expect(AnotherOtter).to.not.equal(TestOtter)
    })
    
    it('should carry across plugins', async function() {
      TestOtter.use(() => {})
      let AnotherOtter = TestOtter.extend()
      expect(AnotherOtter.active.plugins).to.have.lengthOf(1)
    })
    
    it('should not carry across plugins after extension', async function() {
      let AnotherOtter = TestOtter.extend()
      TestOtter.use(() => {})
      expect(AnotherOtter.active.plugins).to.have.lengthOf(0)
    })
    
    it('should shallow copy plugins', async function() {
      TestOtter.use(() => {})
      let AnotherOtter = TestOtter.extend()
      
      // Check they aren't the same objects
      expect(AnotherOtter.active.plugins).to.not.equal(TestOtter.active.plugins)
      
      // Check thet have the same objects in
      expect(AnotherOtter.active.plugins).to.deep.equal(TestOtter.active.plugins)
    })
    
    it('should shallow copy adapters', async function() {
      let AnotherOtter = TestOtter.extend()
      expect(AnotherOtter.active.adapters).to.not.equal(TestOtter.active.adapters)
    })
  })
  
  describe('#addAdapter', function() {
    
    it('should store the adapter', async function() {
      let adapter = { name: 'myAdapter', setup() {} }
      
      TestOtter.addAdapter(adapter)
      
      expect(TestOtter.active.adapters.myAdapter).to.exist
    })
    
    it('should return itself for chaining', async function() {
      let adapter = { name: 'myAdapter', setup() {} }
      expect(TestOtter.addAdapter(adapter)).to.equal(TestOtter)
    })
  })
  
  describe('#addModel', function() {
    
    it('should store the model', async function() {
      TestOtter.addModel(TestModel)
      expect(TestOtter.active.models.TestModel).to.exist
    })
    
    it('should return itself for chaining', async function() {
      expect(TestOtter.addModel(TestModel)).to.equal(TestOtter)
    })
  })
  
  describe('#addCluster', function() {
    it('should store the cluster', async function() {
      TestOtter.addCluster(TestCluster)
      expect(TestOtter.active.clusters.TestCluster).to.exist
    })
    it('should return itself for chaining', async function() {
      expect(TestOtter.addCluster(TestCluster)).to.equal(TestOtter)
    })
  })
  
  describe('#addAttribute', function() {
    
    it('should store the attribute', async function() {
      TestOtter.addAttribute(TestAttribute)
      expect(TestOtter.active.attributes.Test).to.exist
    })
    
    it('should return itself for chaining', async function() {
      expect(TestOtter.addAttribute(TestAttribute)).to.equal(TestOtter)
    })
  })
  
  describe('#addQueryExpr', function() {
    
    it('should store the expr', async function() {
      let expr = (value, type) => { }
      TestOtter.addQueryExpr('myType', expr)
      expect(TestOtter.active.exprs).to.have.lengthOf(1)
    })
    
    it('should structure the expr', async function() {
      let expr = (value, type) => { }
      TestOtter.addQueryExpr('myType', expr)
      expect(TestOtter.active.exprs[0]).to.include({
        name: 'myType',
        validator: expr
      })
    })
    
    it('should default the precedence to 99', async function() {
      let expr = (value, type) => { }
      TestOtter.addQueryExpr('myType', expr)
      expect(TestOtter.active.exprs[0].precedence).to.equal(99)
    })
    
    it('should use the functions precedence', async function() {
      let expr = (value, type) => { }
      expr.precedence = 42
      TestOtter.addQueryExpr('myType', expr)
      expect(TestOtter.active.exprs[0].precedence).to.equal(42)
    })
    
    it('should sort by high precedence first', async function() {
      let exprA = () => { }
      let exprB = () => { }
      exprA.precedence = 1
      exprB.precedence = 2
      TestOtter.addQueryExpr('exprA', exprA)
      TestOtter.addQueryExpr('exprB', exprB)
      expect(TestOtter.active.exprs[0].name).to.equal('exprB')
      expect(TestOtter.active.exprs[1].name).to.equal('exprA')
    })
    
    it('should fail if not a function', async function() {
      let error = await asyncError(() => TestOtter.addQueryExpr('type', 'not an expr'))
      expect(error.code).to.equal('config.invalidQueryExpr')
    })
  })
  
  describe('#start', function() {
    
    let InvalidAdapterModel, ValidModel
    beforeEach(async function() {
      InvalidAdapterModel = class extends Otter.Types.Model {
        static adapterName() { return 'invalid' }
      }
      
      ValidModel = makeModel('ValidModel', { name: String })
      
      TestOtter.use(Otter.Plugins.MemoryConnection)
    })
    
    
    it('should return a promise', async function() {
      expect(TestOtter.start()).to.be.instanceOf(Promise)
    })
    
    it('should register default attributes', async function() {
      await TestOtter.start()
      expect(Object.keys(TestOtter.active.attributes)).to.have.lengthOf.greaterThan(0)
    })
    
    it('should allow custom base attributes', async function() {
      
      // Register a custom string first
      class String extends TestOtter.Types.Attribute { }
      TestOtter.addAttribute(String)
      
      // Start otter
      await TestOtter.start()
      
      // Check our custom string is still registered
      expect(TestOtter.active.attributes.String).to.equal(String)
    })
    
    it('should fail if model has an invalid adapter', async function() {
    
      TestOtter.addModel(InvalidAdapterModel)
    
      let error = await startupError(TestOtter)
      expect(error.code).to.equal('config.invalidAdapter')
    })
    
    it('should succeed with a valid model', async function() {
      TestOtter.addModel(ValidModel)
      await TestOtter.start()
    })
    
    it('should make models active', async function() {
      TestOtter.addModel(ValidModel)
      await TestOtter.start()
      expect(ValidModel.isActive).to.exist
    })
    
    it('should put the adapter onto the model', async function() {
      TestOtter.addModel(ValidModel)
      await TestOtter.start()
      expect(ValidModel.adapter).to.exist
    })
    
    it('should put the schema onto the model', async function() {
      TestOtter.addModel(ValidModel)
      await TestOtter.start()
      expect(ValidModel.schema).to.exist
    })
    
    it('should put the model onto the adapter', async function() {
      TestOtter.addModel(ValidModel)
      await TestOtter.start()
      expect(TestOtter.active.adapters.default.models.ValidModel).to.exist
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
      expect(instance).to.equal(AnotherOtter)
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
      
      let error = await startupError(AnotherOtter)
      expect(error.code).to.equal('config.unsupportedAttr')
    })
    
    it('should fail if an attribute is not valid', async function() {
      
      class Invalid extends Otter.Types.Attribute {
        validateSelf(Otter) { throw new Error('CUSTOM_ERROR') }
      }
      
      class InvalidModel extends Otter.Types.Model {
        static attributes() { return { some: 'Invalid' } }
      }
      
      TestOtter.addAttribute(Invalid)
      TestOtter.addModel(InvalidModel)
      
      let error = await startupError(TestOtter)
      expect(error).matches(/CUSTOM_ERROR/)
    })
    
    it('should let attributes process their values', async function() {
      
      let wasCalled = false
      
      class Processing extends Otter.Types.Attribute {
        processOptions(Otter) { wasCalled = true }
      }
      
      class SomeModel extends Otter.Types.Model {
        static attributes() { return { some: 'Processing' } }
      }
      
      TestOtter.addAttribute(Processing)
      TestOtter.addModel(SomeModel)
      
      await TestOtter.start()
      
      expect(wasCalled).to.equal(true)
    })
    
    it('should fail if no adapters are set', async function() {
      
      let AnotherOtter = Otter.extend()
      let error = await startupError(AnotherOtter)
      expect(error.code).to.equal('config.noAdapters')
    })
    
    it('should return itself for chaining', async function() {
      let returned = await TestOtter.start()
      expect(returned).to.equal(TestOtter)
    })
    
    it('should add exprs to Query', async function() {
      let expr = (value, type) => { }
      TestOtter.addQueryExpr('myType', expr)
      await TestOtter.start()
      expect(Otter.Types.Query.exprs.myType).to.deep.include(expr)
    })
    
    it('should register default expressions', async function() {
      await TestOtter.start()
      expect(Object.keys(Otter.Types.Query.exprs)).to.have.lengthOf.greaterThan(0)
    })
  })
  
})
