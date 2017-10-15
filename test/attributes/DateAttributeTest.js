const expect = require('chai').expect
const assert = require('assert')
const DateAttribute = require('../../lib/attributes/DateAttribute')

describe('DateAttribute', function() {
  
  describe('#valueType', function() {
    it('should be object', function() {
      let attr = new DateAttribute()
      assert.equal(attr.valueType, 'object')
    })
  })
  
})
