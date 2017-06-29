const assert = require('assert')
const assExt = require('../assertExtension')
const { makePluginable } = require('../../lib/utils')

describe('#makePluginable', function() {
  
  let target
  
  beforeEach(function() {
    target = {}
  })
  
  it('should store the active record onto the target', function() {
    makePluginable(target, { })
    assert(target.active)
  })
  
  it('should add a default active record', function() {
    makePluginable(target)
    assert(target.active)
  })
  
  
  describe('target #use', function() {
    
    let plugin = { install() {} }
    
    beforeEach(function() {
      makePluginable(target)
    })
    
    it('should be added to the target', function() {
      assert.equal(typeof target.use, 'function')
    })
    
    it('should store the plugin', function() {
      target.use(plugin)
      assert.equal(target.active.plugins.length, 1)
    })
    
    it('should return the target', function() {
      let rtn = target.use(plugin)
      assert.equal(rtn, target)
    })
    
    it('should fail if not an object', function() {
      assert.throws(() => {
        target.use('not an object')
      }, /Invalid Plugin/)
    })
    
    it('should fail if no install passed', function() {
      assert.throws(() => {
        target.use({})
      }, /Invalid Plugin/)
    })
    
    it('should add plugins using the shorthand', function() {
      target.use(() => { })
      assert.equal(target.active.plugins.length, 1)
    })
    
    it('should call install with "target" as the first param', function() {
      
      let param = false
      let plugin = { install(Otter) { param = Otter } }
      
      target.use(plugin)
      assert.equal(param, target)
    })
    
    it('should call install with extra params', function() {
      
      let extraA = null
      let extraB = null
      let plugin = {
        install(otter, a, b) {
          extraA = a
          extraB = b
        }
      }
      
      target.use(plugin, 'a', 'b')
      
      assert.equal(extraA, 'a')
      assert.equal(extraB, 'b')
    })
    
  })
  
})
