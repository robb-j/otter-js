const expect = require('chai').expect
const mapAndRemove = require('../../../lib/utils/mapAndRemove')

describe('#mapAndRemove', function() {
  
  it('should map a value to its new key', async function() {
    let mapping = { oldKey: 'newKey' }
    let object = { oldKey: 42 }
    
    mapAndRemove(object, mapping)
    
    expect(object.newKey).to.equal(42)
  })
  
  it('should remove the old value', async function() {
    let mapping = { oldKey: 'newKey' }
    let object = { oldKey: 42 }
    
    mapAndRemove(object, mapping)
    
    expect(object.oldKey).to.equal(undefined)
  })
  
  it('should return the object', async function() {
    let mapping = { oldKey: 'newKey' }
    let object = { oldKey: 42 }
    
    let result = mapAndRemove(object, mapping)
    
    expect(result).to.equal(object)
  })
  
})
