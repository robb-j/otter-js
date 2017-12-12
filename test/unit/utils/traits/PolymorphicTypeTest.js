const expect = require('chai').expect

const Otter = require('../../../../lib/Otter')
const { AddTraits, PolymorphicType } = Otter.Utils

const { asyncError, makeModel, makeCluster } = require('../../../utils')


describe('PolymorphicType', function() {

  let PolyAttr, ModelA, ClusterA, ClusterB, ClusterC, TestOtter, attr
  beforeEach(async function() {
    PolyAttr = AddTraits(Otter.Types.Attribute, PolymorphicType)
    ModelA = makeModel('ModelA')
    ClusterA = makeCluster('ClusterA')
    ClusterB = makeCluster('ClusterB')
    ClusterC = class ClusterC extends Otter.Types.Cluster {
      static adapterName() { return 'other' }
    }
    TestOtter = await Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
      .use(Otter.Plugins.MemoryConnection, { name: 'other' })
      .addModel(ModelA)
      .addCluster(ClusterA)
      .addCluster(ClusterB)
      .addCluster(ClusterC)
      .start()
    attr = new PolyAttr('name', 'ModelA')
  })
  
  describe('#validateTypesFromOptions', function() {
    it('should fail if types are not set', async function() {
      let error = await asyncError(() => {
        return attr.validateTypes(TestOtter, ModelA, null)
      })
      
      expect(error.code).to.equal('attr.poly.missingTypes')
    })
    it('should fail if not an array', async function() {
      let error = await asyncError(() => {
        return attr.validateTypes(TestOtter, ModelA, {})
      })
      expect(error.code).to.equal('attr.poly.missingTypes')
    })
    it('should fail if a type is invalid', async function() {
      let error = await asyncError(() => {
        return attr.validateTypes(TestOtter, ModelA, ['InvalidCluster'])
      })
      expect(error.code).to.equal('composite')
      expect(error.subCodes).to.include('attr.poly.invalidType')
    })
    it('should fail for clusters on different adapters', async function() {
      let error = await asyncError(() => {
        return attr.validateTypes(TestOtter, ModelA, ['ClusterC'])
      })
      expect(error.code).to.equal('composite')
      expect(error.subCodes).to.include('attr.poly.invalidType')
      
    })
  })
  
  describe('#storeTypesFromOptions', function() {
    it('should generate a type map', async function() {
      let map = attr.processTypes(TestOtter, ModelA, ['ClusterA', 'ClusterB'])
      expect(map.ClusterA).to.equal(ClusterA)
      expect(map.ClusterB).to.equal(ClusterB)
    })
  })
})
