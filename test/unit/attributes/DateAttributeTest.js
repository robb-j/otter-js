const expect = require('chai').expect
const DateAttribute = require('../../../lib/attributes/DateAttribute')

describe('DateAttribute', function() {
  
  describe('#valueType', function() {
    it('should be object', function() {
      let attr = new DateAttribute()
      expect(attr.valueType).to.equal('object')
    })
  })
  
  describe('#valueMatchesType', function() {
    it('should match dates', async function() {
      let attr = new DateAttribute()
      let result = attr.valueMatchesType(new Date())
      expect(result).to.equal(true)
    })
  })
  
})
