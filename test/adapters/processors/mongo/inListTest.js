const assert = require('assert')
const StringAttr = require('../../../../lib/attributes/StringAttribute')
const processor = require('../../../../lib/adapters/processors/mongo/inList')

describe('InListMongoProcessor', function() {
  it('should convert to mongo syntax', async function() {
    let attr = new StringAttr('myAttr')
    let q = processor(attr, ['A', 'B', 'C'])
    assert(q.myAttr)
    assert(q.myAttr.$in)
    assert.deepEqual(q.myAttr.$in, ['A', 'B', 'C'])
  })
})
