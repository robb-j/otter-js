const expect = require('chai').expect
const StringAttr = require('../../../../lib/attributes/StringAttribute')
const processor = require('../../../../lib/adapters/processors/mongo/equality')

describe('EqualityMongoProcessor', function() {
  it('should convert to mongo syntax', async function() {
    let attr = new StringAttr('myAttr')
    let q = processor(attr, 'Some String')
    expect(q).to.have.property('myAttr', 'Some String')
  })
})
