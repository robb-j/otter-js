const expect = require('chai').expect
const assert = require('assert')
const Otter = require('../../lib/Otter')
const parseAttribute = require('../../lib/utils/parseAttribute')

describe('#parseAttribute', function() {
  
  let available = {
    String: function(n, m, o) { this.name = n; this.model = m; this.options = o },
    Number: function(n, m, o) { this.name = n; this.model = m; this.options = o },
    Boolean: function(n, m, o) { this.name = n; this.model = m; this.options = o }
  }
  
  
  it('should parse type literals', function() {
    let attr = parseAttribute(String, available, 'attr', 'MyModel')
    
    assert(attr)
    assert.equal(attr.constructor.name, 'String')
  })
  
  it('should fail for invalid type literals', function() {
    
    function InvalidLiteral() { }
    assert.throws(() => {
      parseAttribute(InvalidLiteral, available, 'attr', 'MyModel')
    }, /Invalid Type/)
  })
  
  it('should parse string literals', function() {
    let attr = parseAttribute('String', available, 'attr', 'MyModel')
    assert(attr)
  })
  
  it('should fail for invalid string literals types', function() {
    assert.throws(() => {
      parseAttribute('Invalid', available, 'attr', 'MyModel')
    })
  })
  
  it('should parse typed objects', function() {
  
    let raw = { type: 'String' }
    let attr = parseAttribute(raw, available, 'attr', 'MyModel')
    assert(attr)
  })
  
  it('should set name, model & options on new attribute', function() {
    let raw = { type: String, someProp: 'B' }
    let attr = parseAttribute(raw, available, 'myAttr', 'MyModel')
    assert.equal(attr.name, 'myAttr')
    assert.equal(attr.model, 'MyModel')
    assert.equal(attr.options.someProp, 'B')
  })
  
  it('should fail if no type passed', function() {
    let raw = { someProp: 'C' }
    assert.throws(() => {
      parseAttribute(raw, available, 'myAttr', 'MyModel')
    }, /Could not determine type/)
  })
  
  
})
