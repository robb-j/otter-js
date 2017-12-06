const expect = require('chai').expect
const NestOneAttribute = require('../../../lib/attributes/NestOneAttribute')

const Otter = require('../../../lib/Otter')

const { asyncError, makeModel, makeCluster } = require('../../utils')


describe('NestOneAttribute', function() {
  
  let Entity, Component, TestOtter
  beforeEach(async function() {
    Entity = makeModel('Parent', {
      comp: { nestOne: 'Component' }
    })
    Component = makeCluster('Component', { name: String })
    TestOtter = Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
      .addModel(Entity)
      .addCluster(Component)
  })
  
  describe('#valueType', function() {
    it('should be an object', async function() {
      let attr = new NestOneAttribute()
      expect(attr.valueType).to.equal('object')
    })
  })
  
  describe('#enumOptions', function() {
    it('should override to null to disable', async function() {
      let attr = new NestOneAttribute()
      expect(attr.enumOptions).to.equal(null)
    })
  })
  
  describe('#prepareValueForQuery', function() {
  })
  
  describe('#validateSelf', function() {
    it('should fail without a cluster', async function() {
      TestOtter.addModel(makeModel('Invalid', {
        child: { type: 'NestOne' }
      }))
      
      let error = await asyncError(() => TestOtter.start())
      
      expect(error.code).to.equal('attr.nesting.missingCluster')
    })
    it('should fail with an invalid cluster', async function() {
      TestOtter.addModel(makeModel('Invalid', {
        child: { type: 'NestOne', cluster: 'Unknown' }
      }))
      
      let error = await asyncError(() => TestOtter.start())
      
      expect(error.code).to.equal('attr.nesting.invalidCluster')
    })
  })
  
  describe('#processOptions', function() {
    it('should store the cluster type', async function() {
      await TestOtter.start()
      expect(Entity.schema.comp.ClusterType).to.equal(Component)
    })
  })
  
  describe('#installOn', function() {
    
    let entity
    beforeEach(async function() {
      await TestOtter.start()
      entity = new Entity({
        comp: { name: 'Geoff' }
      })
    })
    
    it('should add the cluster record', async function() {
      expect(entity.comp).to.exist
    })
    it('should register cluster\'s attributes', async function() {
      expect(entity.comp.name).to.equal('Geoff')
    })
    
    describe('model#[name]', function() {
      it('should retrieve the cluster', async function() {
        expect(entity.comp).to.exist
      })
      it('should set to a new instance of cluster', async function() {
        let newComp = new Component({ name: 'new' })
        entity.comp = newComp
        expect(entity.comp).to.equal(newComp)
        expect(entity.values.comp).to.equal(newComp.values)
      })
      it('should set to null', async function() {
        entity.comp = null
        expect(entity.comp).to.equal(null)
        expect(entity.values.comp).to.equal(null)
      })
      it('should create a new cluster', async function() {
        let e2 = new Entity({ })
        e2.comp = { name: 'new' }
        expect(e2.comp).to.be.an.instanceOf(Component)
        expect(e2.values.comp).to.have.property('name', 'new')
      })
    })
  })
  
  describe('#validateModelValue', function() {
    it('should use the clusters validation', async function() {
      await TestOtter.start()
      let value = { name: 7 }
      let error = await asyncError(() => Entity.schema.comp.validateModelValue(value))
      expect(error).to.have.property('code', 'attr.validation.type')
    })
  })
  
})
