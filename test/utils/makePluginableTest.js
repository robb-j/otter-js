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
  
  it('should add the use() method', function() {
    makePluginable(target)
    assert.equal(typeof target.use, 'function')
  })
  
  it('should add the extend() method', function() {
    makePluginable(target)
    assert.equal(typeof target.extend, 'function')
  })
  
  
  describe('target methods', function() {
    let plugin = { install() {} }
    
    beforeEach(function() {
      makePluginable(target)
    })
    
    describe('#use', function() {
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
    
    describe('#extend', function() {
      let child
      beforeEach(function() {
        target.active = {
          a: { one: '1', two: '2', three: '3' },
          b: [ 1, 2, 3 ]
        }
        child = target.extend()
      })
      it('should make a child', function() {
        assert.notEqual(child, target)
      })
      it('should copy the active record', function() {
        assert.notEqual(child.active, target.active)
      })
      it('should shallow copy objects', async function() {
        assert.equal(child.active.a, target.active.a)
      })
      it('should shallow copy arrays', async function() {
        assert.equal(child.active.b, target.active.b)
      })
    })
  })
})
