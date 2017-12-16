const expect = require('chai').expect
const NestManyAttribute = require('../../../lib/attributes/NestManyAttribute')

const Otter = require('../../../lib')

const { asyncError, makeModel, makeCluster } = require('../../utils')


describe('NestManyAttribute', function() {

  let Entity, Component, TestOtter
  beforeEach(async function() {
    Entity = makeModel('Parent', {
      comps: { nestMany: 'Component' }
    })
    Component = makeCluster('Component', { name: String })
    TestOtter = Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
      .addModel(Entity)
      .addCluster(Component)
  })

  describe('#valueType', function() {
    it('should be an object', async function() {
      let attr = new NestManyAttribute()
      expect(attr.valueType).to.equal('object')
    })
  })
  
  describe('#enumOptions', function() {
    it('should disable enums', async function() {
      let attr = new NestManyAttribute()
      expect(attr.enumOptions).to.equal(null)
    })
  })
  
  describe('#validateSelf', function() {
    it('should fail without a cluster', async function() {
      TestOtter.addModel(makeModel('Invalid', {
        child: { type: 'NestMany' }
      }))
      
      let error = await asyncError(() => TestOtter.start())
      
      expect(error.code).to.equal('attr.nesting.missingCluster')
    })
    it('should fail with an invalid cluster', async function() {
      TestOtter.addModel(makeModel('Invalid', {
        child: { type: 'NestMany', cluster: 'Unknown' }
      }))
      
      let error = await asyncError(() => TestOtter.start())
      
      expect(error.code).to.equal('attr.nesting.invalidCluster')
    })
  })
  
  describe('#processOptions', function() {
    it('should store the ClusterType', async function() {
      await TestOtter.start()
      expect(Entity.schema.comps.ClusterType).to.equal(Component)
    })
  })
  
  describe('#installOn', function() {
    
    let entity
    beforeEach(async function() {
      await TestOtter.start()
      entity = new Entity({ comps: [
        { name: 'healthy' }, { name: 'meaty' }
      ]})
    })
    
    describe('~getter', function() {
      it('should add a new ClusterArray', async function() {
        entity = new Entity({ })
        expect(entity.comps.constructor.name).to.equal('ClusterArray')
      })
      it('should convert to a ClusterArray', async function() {
        expect(entity.comps.constructor.name).to.equal('ClusterArray')
        expect(entity.comps).to.have.lengthOf(2)
      })
      it('should shallow copy values', async function() {
        entity.comps.pop()
        expect(entity.comps).to.have.lengthOf(2)
      })
    })
    
    describe('~setter', function() {
      it('should set from Cluster instances', async function() {
        let newComp = new Component({ name: 'bready' })
        entity.comps = [ newComp ]
        expect(entity.comps).to.have.lengthOf(1)
        expect(entity.comps[0]).to.equal(newComp)
      })
      it('should set from an array of objects', async function() {
        entity.comps = [ { name: 'Sticky' } ]
        expect(entity.comps).to.have.lengthOf(1)
        expect(entity.comps[0]).to.be.instanceOf(Component)
        expect(entity.comps[0]).to.have.property('name', 'Sticky')
      })
      it('should push Cluster instances', async function() {
        entity.comps.push(new Component({ name: 'Chocolatey' }))
        expect(entity.comps).to.have.lengthOf(3)
      })
      it('should push raw objects', async function() {
        entity.comps.push({ name: 'Slimey' })
        expect(entity.comps).to.have.lengthOf(3)
        expect(entity.comps[2]).to.be.instanceOf(Component)
        expect(entity.comps[2]).to.have.property('name', 'Slimey')
      })
      it('should ignore non-arrays', async function() {
        entity.comps = 5
        expect(entity.comps).to.have.lengthOf(2)
      })
    })
  })
  
  describe('#validateModelValue', function() {
    beforeEach(async function() {
      await TestOtter.start()
    })
    it('should use super', async function() {
      let value = 9
      let error = await asyncError(() => Entity.schema.comps.validateModelValue(value))
      expect(error).to.have.property('code', 'attr.validation.type')
    })
    it('should fail if not an array', async function() {
      let value = { }
      let error = await asyncError(() => Entity.schema.comps.validateModelValue(value))
      expect(error).to.have.property('code', 'attr.validation.notArray')
    })
    it('should use the ClusterType to validate each element', async function() {
      let value = [ { name: 7 } ]
      let error = await asyncError(() => Entity.schema.comps.validateModelValue(value))
      expect(error).to.have.property('code', 'composite')
      expect(error.subCodes).to.include('attr.validation.type')
    })
  })
})
