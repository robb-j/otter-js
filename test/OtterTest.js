const assert = require('assert')
const Otter = require('../lib/Otter')


class TestModel extends Otter.Types.Model {}
class TestAttribute extends Otter.Types.Attribute {}


describe('Otter', function() {
  
  let TestOtter = null
  
  beforeEach(function() {
    
    TestOtter = Otter.extend()
  })
  
  
  
  describe('#use', function() {
    
    it('should exist', function() {
      assert.equal(typeof TestOtter.use, 'function')
    })
    
    it('should store the plugin', function() {
      
      let plugin = {
        install() { }
      }
      TestOtter.use(plugin)
      assert.equal(TestOtter.active.plugins.length, 1)
    })
    
    it('should return Otter', function() {
      
      let plugin = {
        install() { }
      }
      assert.equal(TestOtter.use(plugin), TestOtter)
    })
    
    it('should fail if not an object', function() {
      
      assert.throws(() => {
        TestOtter.use('not an object')
      }, /Invalid Plugin/)
    })
    
    it('should fail if no install passed', function() {
      
      assert.throws(() => {
        TestOtter.use({})
      }, /Invalid Plugin/)
    })
    
    it('should add plugins using the shorthand', function() {
      
      TestOtter.use(() => { })
      assert.equal(TestOtter.active.plugins.length, 1)
    })
    
    
    it('should call install with Otter param', function() {
      
      let param = false
      let plugin = {
        install(Otter) { param = Otter }
      }
      
      TestOtter.use(plugin)
      
      assert(param)
    })
    
    it('should call install with extra args', function() {
      
      let extraA = null
      let extraB = null
      let plugin = {
        install(otter, a, b) {
          extraA = a
          extraB = b
        }
      }
      
      TestOtter.use(plugin, 'a', 'b')
      
      assert.equal(extraA, 'a')
      assert.equal(extraB, 'b')
    })
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
    
    it('should shallow copy queryBuilders', function() {
      let AnotherOtter = TestOtter.extend()
      assert.notEqual(
        AnotherOtter.active.queryBuilders,
        TestOtter.active.queryBuilders
      )
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
  
  
  describe('#addQueryBuilder', function() {
    
    it('should store the query builder', function() {
      let builder = (input, query) => { }
      TestOtter.addQueryBuilder(builder)
      assert.equal(TestOtter.active.queryBuilders.length, 1)
    })
    
    it('should fail if not a function', function() {
      let builder = 'bob'
      assert.throws(() => {
        TestOtter.addQueryBuilder(builder)
      }, /Invalid QueryBuilder/)
    })
    
    it('should fail if not a function', function() {
      let builder = (a) => {}
      assert.throws(() => {
        TestOtter.addQueryBuilder(builder)
      }, /Invalid QueryBuilder Parameters/)
    })
  })
  
})
