const expect = require('chai').expect
const NumberAttribute = require('../../lib/attributes/NumberAttribute')

describe('NumberAttribute', function() {
  
  describe('#valueType', function() {
    it('should be number', function() {
      let attr = new NumberAttribute()
      expect(attr.valueType).to.equal('number')
    })
  })
  
})
