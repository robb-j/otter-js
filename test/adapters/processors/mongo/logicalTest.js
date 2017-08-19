const assert = require('assert')
const NumberAttr = require('../../../../lib/attributes/NumberAttribute')
const processor = require('../../../../lib/adapters/processors/mongo/logical')

describe('LogicalMongoProcessor', function() {
  let adapter, boundProc
  beforeEach(async function() {
    adapter = {
      evaluateExpr: (attr, subExpr) => { return true }
    }
    boundProc = processor.bind(adapter)
  })
  
  it('should convert to mongo syntax', async function() {
    let attr = new NumberAttr('myAttr')
    let expr = {
      'and': [
        { '!': 5 },
        { '!': 7 }
      ]
    }
    let q = boundProc(attr, expr)
    assert(q.$and)
    assert.deepEqual(q.$and, [true, true])
  })
})
