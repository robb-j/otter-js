const expect = require('chai').expect
const NumberAttr = require('../../../../../lib/attributes/NumberAttribute')
const processor = require('../../../../../lib/adapters/processors/mongo/comparison')

describe('ComparisonMongoProcessor', function() {
  let attr = new NumberAttr('myAttr')
  
  it('should convert ">" to mongo syntax', async function() {
    let q = processor('myAttr', attr, { '>': 7 })
    expect(q.myAttr).to.have.property('$gt', 7)
  })
  it('should convert "<" to mongo syntax', async function() {
    let q = processor('myAttr', attr, { '<': 7 })
    expect(q.myAttr).to.have.property('$lt', 7)
  })
  it('should convert ">=" to mongo syntax', async function() {
    let q = processor('myAttr', attr, { '>=': 7 })
    expect(q.myAttr).to.have.property('$gte', 7)
  })
  it('should convert "<=" to mongo syntax', async function() {
    let q = processor('myAttr', attr, { '<=': 7 })
    expect(q.myAttr).to.have.property('$lte', 7)
  })
})
