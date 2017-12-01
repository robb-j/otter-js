const expect = require('chai').expect
const ObjectIDAttribute = require('../../../lib/attributes/ObjectIDAttribute')
const ObjectID = require('mongodb').ObjectID

describe('ObjectIDAttribute', function() {
  
  describe('#valueType', function() {
    it('should be string', function() {
      let attr = new ObjectIDAttribute()
      expect(attr.valueType).to.equal('string')
    })
  })
  
  describe('#valueMatchesType', function() {
    it('should match 24 letter strings', function() {
      let attr = new ObjectIDAttribute()
      let result = attr.valueMatchesType('507f191e810c19729de860ea')
      expect(result).to.equal(true)
    })
    it('should match a mongodb.ObjectID', function() {
      let attr = new ObjectIDAttribute()
      let id = new ObjectID('507f191e810c19729de860ea')
      expect(attr.valueMatchesType(id)).to.equal(true)
    })
  })
  
  describe('#prepareValueForQuery', function() {
    it('should convert strings to ObjectIDs', async function() {
      let attr = new ObjectIDAttribute()
      let result = attr.prepareValueForQuery('507f191e810c19729de860ea')
      expect(result).to.be.an.instanceOf(ObjectID)
    })
  })
  
})
