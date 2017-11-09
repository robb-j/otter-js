const expect = require('chai').expect
const Otter = require('../../lib/Otter')

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
      expect(AnotherOtter).to.not.equal(TestOtter)
    })
    
    it('should carry across plugins', function() {
      TestOtter.use(() => {})
      let AnotherOtter = TestOtter.extend()
      expect(AnotherOtter.active.plugins).to.have.lengthOf(1)
    })
    
    it('should not carry across plugins after extension', function() {
      let AnotherOtter = TestOtter.extend()
      TestOtter.use(() => {})
      expect(AnotherOtter.active.plugins).to.have.lengthOf(0)
    })
    
    it('should shallow copy plugins', function() {
      TestOtter.use(() => {})
      let AnotherOtter = TestOtter.extend()
      
      // Check they aren't the same objects
      expect(AnotherOtter.active.plugins).to.not.equal(TestOtter.active.plugins)
      
      // Check thet have the same objects in
      expect(AnotherOtter.active.plugins).to.deep.equal(TestOtter.active.plugins)
    })
    
    it('should shallow copy adapters', function() {
      let AnotherOtter = TestOtter.extend()
      expect(AnotherOtter.active.adapters).to.not.equal(TestOtter.active.adapters)
    })
  })
  
  
  describe('#addAdapter', function() {
    
    it('should store the adapter', function() {
      let adapter = { name: 'myAdapter', setup() {} }
      
      TestOtter.addAdapter(adapter)
      
      expect(TestOtter.active.adapters.myAdapter).to.exist
    })
    
    it('should fail if already registered', function() {
      
      let adapter = {
        name: 'myAdapter',
        setup() { }
      }
      TestOtter.addAdapter(adapter)
      
      let addingAdapter = () => { TestOtter.addAdapter(adapter) }
      
      expect(addingAdapter).to.throw(/Adapter already registered/)
    })
    
    it('should return itself for chaining', function() {
      let adapter = { name: 'myAdapter', setup() {} }
      expect(TestOtter.addAdapter(adapter)).to.equal(TestOtter)
    })
  })
  
  
  describe('#addModel', function() {
    
    it('should store the model', function() {
      TestOtter.addModel(TestModel)
      expect(TestOtter.active.models.TestModel).to.exist
    })
    
    it('should fail if already registered', function() {
      
      TestOtter.addModel(TestModel)
      
      let addingModel = () => { TestOtter.addModel(TestModel) }
      
      expect(addingModel).to.throw(/Model already registered/)
    })
    
    it('should return itself for chaining', function() {
      expect(TestOtter.addModel(TestModel)).to.equal(TestOtter)
    })
  })
  
  
  describe('#addAttribute', function() {
    
    it('should store the attribute', function() {
      TestOtter.addAttribute(TestAttribute)
      expect(TestOtter.active.attributes.TestAttribute).to.exist
    })
    
    it('should fail if already registered', function() {
      TestOtter.addAttribute(TestAttribute)
      let addingAttribute = () => { TestOtter.addAttribute(TestAttribute) }
      expect(addingAttribute).to.throw(/Attribute already registered/)
    })
    
    it('should return itself for chaining', function() {
      expect(TestOtter.addAttribute(TestAttribute)).to.equal(TestOtter)
    })
  })
  
  
  describe('#addQueryExpr', function() {
    
    it('should store the expr', function() {
      let expr = (value, type) => { }
      TestOtter.addQueryExpr('myType', expr)
      expect(TestOtter.active.exprs.myType).to.equal(expr)
    })
    
    it('should fail if not a function', function() {
      let addingExpr = () => {
        TestOtter.addQueryExpr('type', 'not an expr')
      }
      expect(addingExpr).to.throw(/Invalid QueryExpr/)
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
      
      try {
        await TestOtter.start()
        expect.fail('Should throw')
      }
      catch (error) {
        expect(error).matches(/Invalid adapterName/)
      }
    })
    
    it('should succeed with a valid model', async function() {
      
      TestOtter.addModel(ValidModel)
      
      try {
        await TestOtter.start()
      }
      catch (error) {
        expect.fail(error.message)
      }
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
      
      try {
        await AnotherOtter.start()
        expect.fail('Should throw')
      }
      catch (error) {
        expect(error).matches(/does not support/)
      }
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
      
      try {
        await TestOtter.start()
        expect.fail('Should throw')
      }
      catch (error) {
        expect(error).matches(/an error/)
      }
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
      
      try {
        await AnotherOtter.start()
        expect.fail('Should throw')
      }
      catch (error) {
        expect(error).matches(/No Adapters added/)
      }
    })
    
    it('should return itself for chaining', async function() {
      let returned = await TestOtter.start()
      expect(returned).to.equal(TestOtter)
    })
    
    it('should add exprs to Query', async function() {
      let expr = (value, type) => { }
      TestOtter.addQueryExpr('myType', expr)
      await TestOtter.start()
      expect(Otter.Types.Query.exprs.myType).to.equal(expr)
    })
    
    it('should register default expressions', async function() {
      await TestOtter.start()
      expect(Object.keys(Otter.Types.Query.exprs)).to.have.lengthOf.greaterThan(0)
    })
  })
  
})
