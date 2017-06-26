const assert = require('assert')
const { collectObjectProperty } = require('../../lib/utils')


class TestClass {
  static prop() {
    return { a: 'A' }
  }
}

class SubTestClass extends TestClass {
  static prop() {
    return { b: 'B' }
  }
}

class OverwrittingTestClass extends TestClass {
  static prop() {
    return { a: 'A2' }
  }
}




describe('#collectObjectProperty', function() {
  
  it('should be a function', function() {
    
    assert.equal(typeof collectObjectProperty, 'function')
  })
  
  it('should return the base attributes', function() {
    
    let prop = collectObjectProperty(TestClass, 'prop')
    assert.equal(prop.a, 'A')
  })
  
  it('should collect inherited properties', function() {
    
    let prop = collectObjectProperty(SubTestClass, 'prop')
    assert.equal(prop.a, 'A')
    assert.equal(prop.b, 'B')
  })
  
  it('should overwrite inherited properties', function() {
    
    let prop = collectObjectProperty(OverwrittingTestClass, 'prop')
    assert.equal(prop.a, 'A2')
  })
})
