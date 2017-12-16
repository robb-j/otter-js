const expect = require('chai').expect
const PolyManyAttribute = require('../../../lib/attributes/PolyManyAttribute')

const Otter = require('../../../lib')

const { asyncError, makeModel, makeCluster } = require('../../utils')


describe('PolyManyAttribute', function() {
  
  let Entity, CompA, CompB, TestOtter
  beforeEach(async function() {
    Entity = makeModel('Entity', {
      comps: { type: 'PolyMany', clusters: [ 'CompA', 'CompB' ] }
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
      let Types = Entity.schema.comps.PolyTypes
      expect(Types).to.exist
      expect(Types.CompA).to.equal(CompA)
    })
  })
  
  describe('#installOn', function() {
    
    
    let entity
    beforeEach(async function() {
      await TestOtter.start()
      entity = new Entity({ comps: [
        { _type: 'CompA', name: 'tasty' },
        { _type: 'CompB', size: 100 }
      ]})
    })
    
    it('should set an initial value', async function() {
      expect(entity.comps).to.exist
    })
    
    describe('~getter', function() {
      it('should return values', async function() {
        expect(entity.comps).to.have.lengthOf(2)
      })
      it('should default to []', async function() {
        entity = new Entity()
        expect(entity.comps).to.deep.equal([])
      })
    })
    
    describe('~setter', function() {
      it('should set using cluster instances', async function() {
        let toSet = [
          new CompA({ name: 'fresh' }),
          new CompB({ size: 120 })
        ]
        entity.comps = toSet
        expect(entity.comps).to.deep.equal(toSet)
      })
      it('should add _type from clusters', async function() {
        entity.comps = [
          new CompA({ name: 'jumpy' })
        ]
        expect(entity.comps[0]).to.have.property('_type', 'CompA')
      })
      it('should set using objects with a _type', async function() {
        entity.comps = [
          { _type: 'CompB', size: 12 },
          { _type: 'CompB', size: 31 },
          { _type: 'CompA', name: 'yummy' }
        ]
        expect(entity.comps).to.have.lengthOf(3)
        expect(entity.comps[0]).to.be.instanceof(CompB)
        expect(entity.comps[1]).to.be.instanceof(CompB)
        expect(entity.comps[2]).to.be.instanceof(CompA)
      })
      it('should add _type from values', async function() {
        entity.comps = [
          { _type: 'CompA', name: 'fishy' }
        ]
        expect(entity.comps[0]).to.have.property('_type', 'CompA')
      })
      it('should add _type to the model\'s values', async function() {
        entity.comps = [ new CompA({ name: 'bouncy' }) ]
        expect(entity.values.comps[0]).to.have.property('_type', 'CompA')
      })
    })
    
    describe('~push', function() {
      it('should push values onto the relation', async function() {
        entity.comps.push(
          new CompA({ name: 'fancy' }),
          new CompB({ size: 10 })
        )
        expect(entity.comps).to.have.lengthOf(4)
      })
    })
  })
  
  describe('#validateModelValue', function() {
    beforeEach(async function() {
      await TestOtter.start()
    })
    it('should validate using super', async function() {
      let value = 7
      let error = await asyncError(() => Entity.schema.comps.validateModelValue(value))
      expect(error).to.have.property('code', 'attr.validation.type')
    })
    it('should pass with no value', async function() {
      await Entity.schema.comps.validateModelValue(null)
    })
    it('should fail for non-arrays', async function() {
      let value = { test: 5 }
      let error = await asyncError(() => Entity.schema.comps.validateModelValue(value))
      expect(error).to.have.property('code', 'attr.validation.notArray')
    })
    it('should fail for invalid types', async function() {
      let value = [ { _type: 'Invalid' }, { noType: true } ]
      let error = await asyncError(() => Entity.schema.comps.validateModelValue(value))
      expect(error).to.have.property('code', 'composite')
      expect(error.subCodes).to.include('attr.poly.invalidType')
    })
    it('should validate using the type', async function() {
      let value = [ { _type: 'CompA', name: 100 } ]
      let error = await asyncError(() => Entity.schema.comps.validateModelValue(value))
      expect(error).to.have.property('code', 'composite')
      expect(error.subCodes).to.include('attr.validation.type')
    })
  })
  
})
