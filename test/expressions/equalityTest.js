const expect = require('chai').expect
const equality = require('../../lib/expressions/equality')

describe('EqualityExpression', function() {
  
  it('should match types', function() {
    expect(equality('A String', 'string')).to.equal(true)
  })
})
