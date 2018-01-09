const expect = require('chai').expect
const has = require('../../../lib/expressions/has')
const Otter = require('../../../lib')
const { AssociativeType, AddTraits } = Otter.Utils

const { makeModel } = require('../../utils')

describe('HasExpression', function() {

  let TestModel, Assoc, boundIncludes
  beforeEach(async function() {
    TestModel = makeModel('TestModel', {
      name: 'String', other: 'Assoc'
    })
    Assoc = class extends AddTraits(Otter.Types.Attribute, AssociativeType) {
      associatedCluster() { return TestModel }
      associationCategory() { return 'one' }
    }
    await Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
      .addAttribute(Assoc)
      .addModel(TestModel)
      .start()
    boundIncludes = has.bind(new Otter.Types.Query(TestModel))
  })

  it('should match AssociativeType.one', async function() {
    let result = boundIncludes({ name: 'Geoff' }, TestModel.schema.other)
    expect(result).to.equal(true)
  })
})
