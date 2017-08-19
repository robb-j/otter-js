const assert = require('assert')
const StringAttr = require('../../../../lib/attributes/StringAttribute')
const processor = require('../../../../lib/adapters/processors/mongo/equality')

describe('EqualityMongoProcessor', function() {
  it('should convert to mongo syntax', async function() {
    let attr = new StringAttr('myAttr')
    let q = processor(attr, 'Some String')
    assert(q.myAttr)
    assert.equal(q.myAttr, 'Some String')
  })
})
