const assert = require('assert')
const NumberAttribute = require('../../lib/attributes/NumberAttribute')

describe('NumberAttribute', function() {
  
  describe('#valueType', function() {
    it('should be number', function() {
      let attr = new NumberAttribute()
      assert.equal(attr.valueType, 'number')
    })
  })
  
})
