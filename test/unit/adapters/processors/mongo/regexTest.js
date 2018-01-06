const expect = require('chai').expect
const StringAttr = require('../../../../../lib/attributes/StringAttribute')
const processor = require('../../../../../lib/adapters/processors/mongo/regex')

describe('RegexMongoProcessor', function() {
  it('should convert to mongo syntax', async function() {
    let attr = new StringAttr('myAttr')
    let q = processor('myAttr', attr, /Some/)
    expect(q.myAttr).to.have.property('$regex')
    expect(q.myAttr.$regex).to.deep.equal(/Some/)
  })
})
