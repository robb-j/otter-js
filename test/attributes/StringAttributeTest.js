const assert = require('assert')
const StringAttribute = require('../../lib/attributes/StringAttribute')

describe('StringAttribute', function() {
  
  describe('#valueType', function() {
    it('should be string', function() {
      let attr = new StringAttribute()
      assert.equal(attr.valueType, 'string')
    })
  })
  
})
