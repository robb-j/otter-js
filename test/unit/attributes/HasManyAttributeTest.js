const expect = require('chai').expect
const HasManyAttribute = require('../../../lib/attributes/HasManyAttribute')

const Otter = require('../../../lib/Otter')

const { asyncError, makeModel } = require('../../utils')


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
