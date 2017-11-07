const expect = require('chai').expect
const HasManyAttribute = require('../../../lib/attributes/HasManyAttribute')

const Otter = require('../../../lib/Otter')

const { asyncError, makeModel } = require('../../utils')


describe('HasManyAttribute', function() {
  
  describe('#valueType', function() {
    it('should be null', async function() {
      let attr = new HasManyAttribute()
      expect(attr.valueType).to.equal(null)
    })
  })
  
  describe('#validateSelf', function() {
    
    let TestOtter
    beforeEach(async function() {
      TestOtter = Otter.extend()
        .use(Otter.Plugins.MemoryConnection)
    })
    
    it('should fail without a model', async function() {
      TestOtter.addModel(makeModel('Invalid', {
        children: { type: 'HasMany' }
      }))
      
      let error = await asyncError(() => {
        return TestOtter.start()
      })
      
      expect(error).matches(/No model specified/)
    })
    
    it('should fail if the model is not registered', async function() {
      TestOtter.addModel(makeModel('Invalid', {
        children: { type: 'HasMany', model: 'Child' }
      }))
      
      let error = await asyncError(() => {
        return TestOtter.start()
      })
      
      expect(error).matches(/Invalid model specified/)
    })
  })
  
})
