const expect = require('chai').expect
const PolymorphicAttribute = require('../../../lib/attributes/PolymorphicAttribute')

const Otter = require('../../../lib/Otter')

const { makeModel, makeCluster } = require('../../utils')


describe('PolymorphicAttribute', function() {
  
  let Entity, CompA, CompB, TestOtter
  beforeEach(async function() {
    Entity = makeModel('Entity', {
      comp: { type: 'Polymorphic', clusters: [ 'CompA', 'CompB' ] }
    })
    CompA = makeCluster('CompA', { name: String })
    CompB = makeCluster('CompB', { size: Number })
    TestOtter = Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
      .addModel(Entity)
      .addCluster(CompA)
      .addCluster(CompB)
  })
  
  it('should use PolymorphicType', async function() {
    await TestOtter.start()
    expect(PolymorphicAttribute.traits).includes('PolymorphicType')
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
  
  describe('#processOptions', function() {
    it('should store types', async function() {
      await TestOtter.start()
      let Types = Entity.schema.comp.PolyTypes
      expect(Types).to.exist
      expect(Types.CompA).to.equal(CompA)
    })
  })
  
  describe('#installOn', function() {
    
    let entity
    beforeEach(async function() {
      await TestOtter.start()
      entity = new Entity({ })
    })
    
    it('should set the initial value', async function() {
      entity = new Entity({ comp: {
        _type: 'CompA', name: 'Geremy'
      }})
      expect(entity.comp).to.have.property('name', 'Geremy')
      expect(entity.comp).to.have.property('_type', 'CompA')
    })
    
    describe('model#[name] getter', function() {
      it('should provide a default', async function() {
        expect(entity.comp).to.deep.equal({ _type: null })
      })
      it('should return the cluster', async function() {
        entity.comp = new CompA({ name: 'Geoff' })
        expect(entity.comp).to.have.property('name', 'Geoff')
      })
      it('should add a _type', async function() {
        entity.comp = new CompA({ name: 'Geoff' })
        expect(entity.comp).to.have.property('_type', 'CompA')
      })
    })
    
    describe('model#[name] setter', function() {
      it('should set using an instance', async function() {
        let component = new CompB({ size: 42 })
        entity.comp = component
        expect(entity.comp).to.equal(component)
      })
      it('should set to null', async function() {
        entity.comp = new CompB({ size: 1337 })
        entity.comp = null
        expect(entity.comp).to.deep.equal({ _type: null })
      })
      it('should set from values', async function() {
        entity.comp = { _type: 'CompA', name: 'Thomas' }
        expect(entity.comp).to.have.property('name', 'Thomas')
        expect(entity.comp).to.have.property('_type', 'CompA')
        expect(entity.comp).to.be.an.instanceOf(CompA)
      })
    })
  })
  
})
