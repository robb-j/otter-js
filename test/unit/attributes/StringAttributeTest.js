const expect = require('chai').expect
const StringAttribute = require('../../../lib/attributes/StringAttribute')

describe('StringAttribute', function() {
  
  describe('#valueType', function() {
    it('should be string', function() {
      let attr = new StringAttribute()
      expect(attr.valueType).to.equal('string')
    })
  })
  
})
