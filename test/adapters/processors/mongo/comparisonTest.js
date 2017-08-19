const assert = require('assert')
const NumberAttr = require('../../../../lib/attributes/NumberAttribute')
const processor = require('../../../../lib/adapters/processors/mongo/comparison')

describe('ComparisonMongoProcessor', function() {
  let attr = new NumberAttr('myAttr')
  
  it('should convert ">" to mongo syntax', async function() {
    let q = processor(attr, { '>': 7 })
    assert(q.myAttr)
    assert(q.myAttr.$gt)
    assert.equal(q.myAttr.$gt, 7)
  })
  it('should convert "<" to mongo syntax', async function() {
    let q = processor(attr, { '<': 7 })
    assert(q.myAttr)
    assert(q.myAttr.$lt)
    assert.equal(q.myAttr.$lt, 7)
  })
  it('should convert ">=" to mongo syntax', async function() {
    let q = processor(attr, { '>=': 7 })
    assert(q.myAttr)
    assert(q.myAttr.$gte)
    assert.equal(q.myAttr.$gte, 7)
  })
  it('should convert "<=" to mongo syntax', async function() {
    let q = processor(attr, { '<=': 7 })
    assert(q.myAttr)
    assert(q.myAttr.$lte)
    assert.equal(q.myAttr.$lte, 7)
  })
})
