const expect = require('chai').expect
const PolyManyAttribute = require('../../../lib/attributes/PolyManyAttribute')

const Otter = require('../../../lib/Otter')

const { asyncError, makeModel, makeCluster } = require('../../utils')


describe('PolyManyAttribute', function() {
  
  let Entity, CompA, CompB, TestOtter
  beforeEach(async function() {
    Entity = makeModel('Entity', {
      comp: { type: 'PolyMany', clusters: [ 'CompA', 'CompB' ] }
    })
    CompA = makeCluster('CompA', { name: String })
    CompB = makeCluster('CompB', { size: Number })
    TestOtter = Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
      .addModel(Entity)
      .addCluster(CompA)
      .addCluster(CompB)
  })
  
  it('should use PolymorphicTypes', async function() {
    expect(PolyManyAttribute.traits).includes('PolymorphicType')
  })
  
  describe('#valueType', function() {
    it('should be an object', async function() {
      let attr = new PolyManyAttribute()
      expect(attr.valueType).to.equal('object')
    })
  })
  
  describe('#enumOptions', function() {
    it('should override to null to disable', async function() {
      let attr = new PolyManyAttribute('Model', 'name', { enum: [ {}, {} ] })
      expect(attr.enumOptions).to.equal(null)
    })
  })
  
  describe('#prepareValueForQuery', function() {
  })
  
  describe('#processOptions', function() {
    it('should store types', async function() {
      await TestOtter.start()
      let Types = Entity.schema.comp.PolyTypes
      expect(Types).to.exist
      expect(Types.CompA).to.equal(CompA)
    })
  })
  
  describe('#installOn', function() {
    
    // ...
  })
  
  // describe('#validateModelValue', function() {
  //   beforeEach(async function() {
  //     await TestOtter.start()
  //   })
  //   it('should validate using super', async function() {
  //     let value = 7
  //     let error = await asyncError(() => Entity.schema.comp.validateModelValue(value))
  //     expect(error).to.have.property('code', 'attr.validation.type')
  //   })
  //   it('should fail for invalid types', async function() {
  //     let value = { _type: 'Invalid' }
  //     let error = await asyncError(() => Entity.schema.comp.validateModelValue(value))
  //     expect(error.code).to.equal('attr.poly.invalidType')
  //   })
  //   it('should validate using the type', async function() {
  //     let value = { _type: 'CompA', name: 7 }
  //     let error = await asyncError(() => Entity.schema.comp.validateModelValue(value))
  //     expect(error).to.have.property('code', 'composite')
  //     expect(error.subCodes).to.include('attr.validation.type')
  //   })
  // })
  
})
