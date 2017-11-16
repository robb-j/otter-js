const expect = require('chai').expect
const equality = require('../../../lib/expressions/equality')
const StringAttribute = require('../../../lib/attributes/StringAttribute')

describe('EqualityExpression', function() {
  
  it('should match types', function() {
    let attr = new StringAttribute('name', 'ModelName')
    let result = equality('A String', attr)
    expect(result).to.equal(true)
  })
})
