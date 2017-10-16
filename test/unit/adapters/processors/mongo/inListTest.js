const expect = require('chai').expect
const StringAttr = require('../../../../../lib/attributes/StringAttribute')
const processor = require('../../../../../lib/adapters/processors/mongo/inList')

describe('InListMongoProcessor', function() {
  it('should convert to mongo syntax', async function() {
    let attr = new StringAttr('myAttr')
    let q = processor(attr, ['A', 'B', 'C'])
    expect(q.myAttr).to.have.property('$in')
    expect(q.myAttr.$in).to.deep.equal([ 'A', 'B', 'C' ])
  })
})
