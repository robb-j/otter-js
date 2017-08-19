const assert = require('assert')
const StringAttr = require('../../../../lib/attributes/StringAttribute')
const processor = require('../../../../lib/adapters/processors/mongo/regex')

describe('RegexMongoProcessor', function() {
  it('should convert to mongo syntax', async function() {
    let attr = new StringAttr('myAttr')
    let q = processor(attr, /Some/)
    assert(q.myAttr)
    assert(q.myAttr.$regex)
    assert.deepEqual(q.myAttr.$regex, /Some/)
  })
})
