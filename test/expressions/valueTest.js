const assert = require('assert')
const valueExpr = require('../../lib/expressions/value')

describe('ValueExpression', function() {
  
  it('should match types', function() {
    assert.equal(valueExpr('A String', 'string'), true)
  })
})
