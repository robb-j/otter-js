const expect = require('chai').expect
const HasOneAttribute = require('../../../lib/attributes/HasOneAttribute')

const Otter = require('../../../lib/Otter')

const { asyncError, makeModel } = require('../../utils')


describe('HasOneAttribute', function() {
  
  describe('#valueType', function() {
    it('should be a string', async function() {
      let attr = new HasOneAttribute()
      expect(attr.valueType).to.equal('string')
    })
  })
  
  describe('#validateSelf', function() {
    
    let TestOtter, Parent
    beforeEach(async function() {
      
      Parent = makeModel('Parent', {
        child: { hasOne: 'Child' }
      })
      
      TestOtter = await Otter.extend()
        .use(Otter.Plugins.MemoryConnection)
    })
    
    
    it('should fail without a model', async function() {
      
      const Invalid = makeModel('Invalid', {
        child: { type: 'HasOne' }
      })
      
      TestOtter.addModel(Invalid)
      
      let error = await asyncError(() => {
        return TestOtter.start()
      })
      
      expect(error).matches(/No model specified/)
    })
    
    it('should fail if the model is not registered', async function() {
      TestOtter.addModel(Parent)
      
      let error = await asyncError(() => {
        return TestOtter.start()
      })
      
      expect(error).matches(/Invalid model/)
    })
  })
  
  
  describe('#installOn', function() {
    
    let Parent, Child, geremy, timmy, bobby
    beforeEach(async function() {
      Parent = makeModel('Parent', {
        child: { hasOne: 'Child' }
      })
      Child = makeModel('Child', { name: 'String' })
      await Otter.extend()
        .use(Otter.Plugins.MemoryConnection)
        .addModel(Parent)
        .addModel(Child)
        .start()
      
      timmy = await Child.create({ name: 'Timmy' })
      bobby = await Child.create({ name: 'Bobby' })
      geremy = await Parent.create({ child: timmy.id })
    })
    
    it('should default the value to null', async function() {
      let clarence = await Parent.create({ })
      expect(clarence.values.child).to.equal(null)
    })
    
    it('should add an accessor method', async function() {
      let child = await geremy.child()
      expect(child.name).to.equal('Timmy')
    })
    
    it('should define an id getter', async function() {
      expect(geremy.child_id).to.equal(timmy.id)
    })
    
    it('should define an id setter', async function() {
      geremy.child_id = bobby.id
      expect(geremy.child_id).to.equal(bobby.id)
    })
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
