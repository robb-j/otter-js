const expect = require('chai').expect
const assert = require('assert')
const { makePluginable } = require('../../lib/utils')

describe('#makePluginable', function() {
  
  let target
  
  beforeEach(function() {
    target = {}
  })
  
  it('should store the active record onto the target', function() {
    makePluginable(target, { })
    expect(target.active).to.exist
  })
  
  it('should add a default active record', function() {
    makePluginable(target)
    expect(target.active).to.exist
  })
  
  it('should add the use() method', function() {
    makePluginable(target)
    expect(target.use).to.be.a('function')
  })
  
  it('should add the extend() method', function() {
    makePluginable(target)
    expect(target.extend).to.be.a('function')
  })
  
  
  describe('target methods', function() {
    let plugin = { install() {} }
    
    beforeEach(function() {
      makePluginable(target)
    })
    
    describe('#use', function() {
      it('should store the plugin', function() {
        target.use(plugin)
        expect(target.active.plugins.length).to.equal(1)
      })
      it('should return the target', function() {
        let rtn = target.use(plugin)
        expect(rtn).to.equal(target)
      })
      it('should fail if not an object', function() {
        try {
          target.use('not an object')
          expect.fail('Should throw')
        }
        catch (error) {
          expect(error).matches(/Invalid Plugin/)
        }
      })
      it('should fail if no install passed', function() {
        try {
          target.use({})
          expect.fail('Should throw')
        }
        catch (error) {
          expect(error).matches(/Invalid Plugin/)
        }
        
      })
      it('should add plugins using the shorthand', function() {
        target.use(() => { })
        expect(target.active.plugins.length).to.equal(1)
      })
      it('should call install with "target" as the first param', function() {
        
        let param = false
        let plugin = { install(Otter) { param = Otter } }
        
        target.use(plugin)
        expect(param).to.equal(target)
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
        
        expect(extraA).to.equal('a')
        expect(extraB).to.equal('b')
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
        expect(child).to.not.equal(target)
      })
      it('should copy the active record', function() {
        expect(child.active).to.not.equal(target.active)
      })
      it('should shallow copy objects', async function() {
        expect(child.active.a).to.equal(target.active.a)
      })
      it('should shallow copy arrays', async function() {
        expect(child.active.b).to.equal(target.active.b)
      })
    })
  })
})
