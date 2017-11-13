const expect = require('chai').expect
const BooleanAttribute = require('../../../lib/attributes/BooleanAttribute')

describe('BooleanAttribute', function() {
  
  describe('#valueType', function() {
    it('should be object', function() {
      let attr = new BooleanAttribute()
      expect(attr.valueType).to.equal('boolean')
    })
  })
  
})
