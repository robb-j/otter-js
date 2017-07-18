const assert = require('assert')
const equality = require('../../lib/expressions/equality')

describe('EqualityExpression', function() {
  
  it('should match types', function() {
    assert.equal(equality('A String', 'string'), true)
  })
})
