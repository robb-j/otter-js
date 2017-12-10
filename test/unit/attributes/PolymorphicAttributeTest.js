const expect = require('chai').expect
const PolymorphicAttribute = require('../../../lib/attributes/PolymorphicAttribute')

const Otter = require('../../../lib/Otter')

const { asyncError, makeModel, makeCluster } = require('../../utils')


describe.only('PolymorphicAttribute', function() {
  
  let Entity, CompA, CompB, TestOtter
  beforeEach(async function() {
    Entity = makeModel('Entity', {
      comp: { type: 'Polymorphic', types: [ 'CompA', 'CompB' ] }
    })
    CompA = makeCluster('CompA', { name: String })
    CompB = makeCluster('CompB', { size: Number })
    TestOtter = Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
      .addModel(Entity)
      .addCluster(CompA)
      .addCluster(CompB)
  })
  
  describe('#valueType', function() {
    it('should be an object', async function() {
      let attr = new PolymorphicAttribute()
      expect(attr.valueType).to.equal('object')
    })
  })
  
  describe('#enumOptions', function() {
    it('should override to null to disable', async function() {
      let attr = new PolymorphicAttribute()
      expect(attr.enumOptions).to.equal(null)
    })
  })
  
  describe('#prepareValueForQuery', function() {
  })
  
  describe('#validateSelf', function() {
    it('should fail without types', async function() {
      TestOtter.addModel(makeModel('InvalidModel', {
        comp: { type: 'Polymorphic' }
      }))
      
      let error = await asyncError(() => TestOtter.start())
      
      expect(error.code).to.equal('attr.poly.missingTypes')
    })
    it.skip('should fail with invalid types', async function() {
      TestOtter.addModel(makeModel('InvalidModel', {
        comp: { type: 'Polymorphic', types: [ 'InvalidCluster' ] }
      }))
      
      let error = await asyncError(() => TestOtter.start())
      
      expect(error.code).to.equal('attr.poly.invalidTypes')
      // TODO: (^) Lost info for composite errors
    })
  })
  
  describe('#processOptions', function() {
    it('should store key-mapped types', async function() {
      await TestOtter.start()
      let Types = Entity.schema.comp.PolyTypes
      expect(Types).to.exist
      expect(Types.CompA).to.equal(CompA)
      expect(Types.CompB).to.equal(CompB)
    })
  })
  
})
