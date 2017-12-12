const expect = require('chai').expect

const Otter = require('../../../../lib/Otter')
const { AddTraits, RelationType } = Otter.Utils

const { asyncError, makeModel } = require('../../../utils')


describe('RelationType', function() {
  
  let RelAttr, ModelA, ModelB, ModelC, TestOtter, attr
  beforeEach(async function() {
    RelAttr = AddTraits(Otter.Types.Attribute, RelationType)
    ModelA = makeModel('ModelA')
    ModelB = makeModel('ModelB')
    ModelC = class ModelC extends Otter.Types.Model {
      static adapterName() { return 'other' }
    }
    TestOtter = await Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
      .use(Otter.Plugins.MemoryConnection, { name: 'other' })
      .addModel(ModelA)
      .addModel(ModelB)
      .addModel(ModelC)
      .start()
    attr = new RelAttr('name', 'ModelA')
  })
  
  describe('#validateModel', function() {
    it('should fail if it does not exist', async function() {
      let error = await asyncError(() => {
        return attr.validateModel(TestOtter, ModelA, 'InvalidModel')
      })
      expect(error.code).to.equal('attr.relation.invalidModel')
    })
    it('should fail if on a different adapter', async function() {
      let error = await asyncError(() => {
        return attr.validateModel(TestOtter, ModelA, 'ModelC')
      })
      expect(error.code).to.equal('attr.relation.invalidModel')
    })
  })
  
  describe('#storeRelatedType', function() {
    it('should get the type', async function() {
      let ModelType = attr.relatedType(TestOtter, 'ModelB')
      expect(ModelType).to.equal(ModelB)
    })
  })
})
