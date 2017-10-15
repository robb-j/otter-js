const expect = require('chai').expect
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
    expect(collectObjectProperty).to.be.a('function')
  })
  
  it('should return the base attributes', function() {
    let prop = collectObjectProperty(TestClass, 'prop')
    expect(prop.a).to.equal('A')
  })
  
  it('should collect inherited properties', function() {
    let prop = collectObjectProperty(SubTestClass, 'prop')
    expect(prop.a).to.equal('A')
    expect(prop.b).to.equal('B')
  })
  
  it('should overwrite inherited properties', function() {
    let prop = collectObjectProperty(OverwrittingTestClass, 'prop')
    expect(prop.a).to.equal('A2')
  })
})
