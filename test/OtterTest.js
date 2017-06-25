const assert = require('assert')
const Otter = require('../lib/Otter')

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
      assert.equal(TestOtter.plugins.length, 1)
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
      assert.equal(TestOtter.plugins.length, 1)
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
      
      assert.equal(AnotherOtter.plugins.length, 1)
    })
    
    it('should not carry across plugins after extension', function() {
      
      let AnotherOtter = TestOtter.extend()
      
      TestOtter.use(() => {})
      
      assert.equal(AnotherOtter.plugins.length, 0)
    })
    
  })
  
})
