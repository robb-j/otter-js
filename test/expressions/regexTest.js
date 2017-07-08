const assert = require('assert')
const regexExpr = require('../../lib/expressions/regex')

describe('RegexExpression', function() {
  
  it('should pass with regex', function() {
    assert.equal(regexExpr(/something/, 'string'), true)
  })
  
  it('should fail if not string', function() {
    assert.equal(regexExpr(/something/, 'number'), false)
  })
  
  it('should fail if not a regex', function() {
    assert.equal(regexExpr('not a regex', 'string'), false)
  })
})
