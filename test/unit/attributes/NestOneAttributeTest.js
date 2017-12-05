const expect = require('chai').expect
const NestOneAttribute = require('../../../lib/attributes/NestOneAttribute')

const Otter = require('../../../lib/Otter')

const { asyncError, makeModel, makeCluster } = require('../../utils')


describe.only('NestOneAttribute', function() {
  
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
  
  describe('#valueMatchesType', function() {
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
  })
  
})