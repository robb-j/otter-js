const expect = require('chai').expect
const regexExpr = require('../../lib/expressions/regex')

describe('RegexExpression', function() {
  
  it('should pass with regex', function() {
    expect(regexExpr(/something/, 'string')).to.equal(true)
  })
  
  it('should fail if not string', function() {
    expect(regexExpr(/something/, 'number')).to.equal(false)
  })
  
  it('should fail if not a regex', function() {
    expect(regexExpr('not a regex', 'string')).to.equal(false)
  })
})
