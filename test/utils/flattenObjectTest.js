const assert = require('assert')
const { flattenObject } = require('../../lib/utils')

describe('#flattenObject', function() {
  
  it('should do nothing for a regular object', function() {
    
    let object = { a: 10, b: 'hello' }
    
    let flat = flattenObject(object)
    
    assert.deepEqual(flat, object)
  })
  
  it('should reduce nested objects to dot notation', function() {
    
    let object = {
      a: { num: 10, str: 'hello' }
    }
    
    let flat = flattenObject(object)
    
    let expected = {
      'a.num': 10, 'a.str': 'hello'
    }
    
    assert.deepEqual(flat, expected)
  })
  
  it('should ignore non-owned objects', function() {
    
    // A class with a default value
    class Test { }
    Test.prototype.unowned = '14'
    
    
    // Create an instance
    let object = new Test()
    
    
    // Flatten the object
    let flat = flattenObject(object)
    
    
    // Make sure it didn't flatted the unowned property
    assert.equal(flat.unowned, undefined)
  })
  
})
