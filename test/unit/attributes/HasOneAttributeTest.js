const expect = require('chai').expect
const HasOneAttribute = require('../../../lib/attributes/HasOneAttribute')

const Otter = require('../../../lib/Otter')

const { asyncError, makeModel } = require('../../utils')


describe.only('HasOneAttribute', function() {
  
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
    
    let Parent, Child, geremy, timmy
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
      geremy = await Parent.create({ child: timmy.id })
    })
    
    it('should define a function on the model', async function() {
      expect(geremy.child).to.be.a('function')
    })
    
    it('should add an accessor method', async function() {
      let child = await geremy.child()
      expect(child.name).to.equal('Timmy')
    })
    
    it('should define an id getter', async function() {
      expect(geremy.child_id).to.equal(timmy.id)
    })
    
    it('should define an id setter', async function() {
      let bobby = await Child.create({ name: 'Bobby' })
      geremy.child_id = bobby.id
      expect(geremy.child_id).to.equal(bobby.id)
    })
  })
  
})
