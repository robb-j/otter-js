const expect = require('chai').expect
const HasManyAttribute = require('../../../lib/attributes/HasManyAttribute')

const Otter = require('../../../lib/Otter')

const { asyncError, makeModel } = require('../../utils')


describe('HasManyAttribute', function() {
  
  let TestOtter
  beforeEach(async function() {
    TestOtter = Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
  })
  
  describe('#valueType', function() {
    it('should be null', async function() {
      let attr = new HasManyAttribute()
      expect(attr.valueType).to.equal(null)
    })
  })
  
  describe('#validateSelf', function() {
    
    it('should fail without a model', async function() {
      TestOtter.addModel(makeModel('Invalid', {
        children: { type: 'HasMany' }
      }))
      
      let error = await asyncError(() => TestOtter.start())
      
      expect(error).matches(/No model specified/)
    })
    
    it('should fail if the model is not registered', async function() {
      TestOtter.addModel(makeModel('Invalid', {
        children: { type: 'HasMany', model: 'Child' }
      }))
      
      let error = await asyncError(() => TestOtter.start())
      
      expect(error).matches(/Invalid model specified/)
    })
    
    it('should validate "via" syntax', async function() {
    
      let Person = makeModel('Person', {
        children: { type: 'HasMany', model: 'Child via parent' }
      })
      let Child = makeModel('Child', {
        parent: { type: 'HasOne', model: 'Person' }
      })
      
      await TestOtter.addModel(Person).addModel(Child).start()
    })
    
    it('should fail if there is no via', async function() {
      TestOtter.addModel(makeModel('Invalid', {
        children: { type: 'HasMany', model: 'Child' }
      }))
      TestOtter.addModel(makeModel('Child'))
      let error = await asyncError(() => TestOtter.start())
      expect(error).matches(/No 'via' attribute specified/)
    })
    
    it.skip('should fail if the via does not match', async function() {
      TestOtter.addModel(makeModel('Invalid', {
        children: { type: 'HasMany', model: 'Child via parent' }
      }))
      TestOtter.addModel(makeModel('Child'))
      let error = await asyncError(() => TestOtter.start())
      expect(error).matches(/via attribute 'parent' does not exist/)
    })
  })
  
  describe('#installOn', function() {
    // ...
  })
  
  describe('#processOptions', function() {
    
    let ModelA, ModelB
    beforeEach(async function() {
      ModelA = makeModel('ModelA', {
        brother: { type: 'HasOne', model: 'ModelB' }
      })
      ModelB = makeModel('ModelB')
      
      await Otter.extend()
        .use(Otter.Plugins.MemoryConnection)
        .addModel(ModelA)
        .addModel(ModelB)
        .start()
    })
    
    it('should store the target type', async function() {
      expect(ModelA.schema.brother.targetModel).to.equal(ModelB)
    })
    
  })
  
})
