const expect = require('chai').expect
const HasManyAttribute = require('../../../lib/attributes/HasManyAttribute')

const Otter = require('../../../lib')

const { asyncError, makeModel } = require('../../utils')

function makeGrandParentModel(targetModel) {
  return makeModel('GrandParent', {
    children: { type: 'HasMany', model: targetModel }
  })
}

function makeParentModel(targetModel) {
  return makeModel('Parent', {
    children: { type: 'HasMany', model: targetModel }
  })
}

function makeChildModel(attrType, targetModel) {
  return makeModel('Child', {
    parent: { type: attrType, model: targetModel }
  })
}

function getStartupError(Otter) {
  return asyncError(() => Otter.start())
}


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
      
      TestOtter.addModel(makeParentModel(undefined))
      
      let error = await getStartupError(TestOtter)
      expect(error.code).to.equal('attr.relation.missingModel')
    })
    
    it('should fail if the model is not registered', async function() {
      
      TestOtter.addModel(makeParentModel('Child'))
      
      let error = await getStartupError(TestOtter)
      expect(error.code).to.equal('attr.relation.invalidModel')
    })
    
    it('should validate "via" syntax', async function() {
      
      TestOtter.addModel(makeParentModel('Child via parent'))
      TestOtter.addModel(makeChildModel('HasOne', 'Parent'))
      
      await TestOtter.start()
    })
    
    it('should fail if there is no via', async function() {
      
      TestOtter.addModel(makeParentModel('Child'))
      TestOtter.addModel(makeModel('Child'))
      
      let error = await getStartupError(TestOtter)
      expect(error.code).to.equal('attr.hasMany.noVia')
    })
    
    it('should fail if the via does not match', async function() {
      
      TestOtter.addModel(makeParentModel('Child via parent'))
      TestOtter.addModel(makeModel('Child'))
      
      let error = await getStartupError(TestOtter)
      expect(error.code).to.equal('attr.hasMany.missingVia')
    })
    
    it('should fail if the via attribute is not a HasOne', async function() {
      
      TestOtter.addModel(makeParentModel('Child via parent'))
      TestOtter.addModel(makeChildModel('String'))
      
      let error = await getStartupError(TestOtter)
      expect(error.code).to.equal('attr.hasMany.invalidVia')
    })
    
    it('should fail if the via attribute is for the wrong model', async function() {
      TestOtter.addModel(makeParentModel('Child via parent'))
      TestOtter.addModel(makeChildModel('HasOne', 'AnotherParent'))
      TestOtter.addModel(makeModel('AnotherParent'))
      
      let error = await getStartupError(TestOtter)
      expect(error.code).to.equal('attr.hasMany.invalidVia')
    })
  })
  
  describe('#installOn', function() {
    
    let Parent, Child, geremy, timmy, bobby
    beforeEach(async function() {
      Parent = makeModel('Parent', {
        children: { hasMany: 'Child via parent' }
      })
      Child = makeModel('Child', {
        name: 'String',
        parent: { hasOne: 'Parent' }
      })
      await Otter.extend()
        .use(Otter.Plugins.MemoryConnection)
        .addModel(Parent)
        .addModel(Child)
        .start()
      
      geremy = await Parent.create({ })
      timmy = await Child.create({ name: 'Timmy', parent: geremy.id })
      bobby = await Child.create({ name: 'Bobby', parent: geremy.id })
    })
    
    
    it('should add an accessor method', async function() {
      let children = await geremy.children()
      expect(children).to.have.lengthOf(2)
    })
    
    describe('model#add', function() {
      it('update the child\'s relation', async function() {
        let billy = await Child.create({ name: 'Billy' })
        await geremy.children.add(billy)
        expect(billy.parent_id).to.equal(geremy.id)
      })
      it('should use nested relations', async () => {
        
      })
    })
    
    describe('model#remove', function() {
      it('should remove a child by its id', async function() {
        await geremy.children.remove(timmy.id)
        expect(timmy.parent_id).to.equal(null)
      })
      
      it('should remove a child by instances', async function() {
        await geremy.children.remove(timmy)
        expect(timmy.parent_id).to.equal(null)
      })
      
      it('should remove multiple by ids', async function() {
        await geremy.children.remove([timmy.id, bobby.id])
        expect(timmy.parent_id).to.equal(null)
        expect(bobby.parent_id).to.equal(null)
      })
      
      it('should remove multiple by instances', async function() {
        await geremy.children.remove([timmy, bobby])
        expect(timmy.parent_id).to.equal(null)
        expect(bobby.parent_id).to.equal(null)
      })
      
      it('should fail with unknow arguements', async function() {
        let error = await asyncError(() => {
          return geremy.children.remove(new Date())
        })
        expect(error.code).to.equal('attr.hasMany.invalidRemove')
      })
    })
    
    describe('model#clear', function() {
      it('should remove all relations', async function() {
        await geremy.children.clear()
        expect(timmy.parent_id).to.equal(null)
        expect(bobby.parent_id).to.equal(null)
      })
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
      expect(ModelA.schema.brother.TargetModel).to.equal(ModelB)
    })
    
  })
  
})
