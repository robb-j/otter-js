const expect = require('chai').expect
const regexExpr = require('../../../lib/expressions/regex')
const StringAttribute = require('../../../lib/attributes/StringAttribute')
const NumberAttribute = require('../../../lib/attributes/NumberAttribute')

describe('RegexExpression', function() {
  
  let attr
  beforeEach(async function() {
    attr = new StringAttribute('name', 'ModelName')
  })
  
  it('should pass with regex', function() {
    let result = regexExpr(/something/, attr)
    expect(result).to.equal(true)
  })
  
  it('should fail if not string', function() {
    attr = new NumberAttribute('name', 'ModelName')
    let result = regexExpr(/something/, attr)
    expect(result).to.equal(false)
  })
  
  it('should fail if not a regex', function() {
    let result = regexExpr('not a regex', attr)
    expect(result).to.equal(false)
  })
})
