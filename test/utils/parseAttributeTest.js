// const assert = require('assert')
const expect = require('chai').expect
const parseAttribute = require('../../lib/utils/parseAttribute')

describe('#parseAttribute', function() {
  
  let available = {
    String: function(n, m, o) { this.name = n; this.model = m; this.options = o },
    Number: function(n, m, o) { this.name = n; this.model = m; this.options = o },
    Boolean: function(n, m, o) { this.name = n; this.model = m; this.options = o }
  }
  
  
  it('should parse type literals', function() {
    let attr = parseAttribute(String, available, 'attr', 'MyModel')
    // assert(attr)
    // assert.equal(attr.constructor.name, 'String')
    expect(attr.constructor.name).to.equal('String')
  })
  
  it('should fail for invalid type literals', function() {
    function InvalidLiteral() { }
    let callingParse = () => {
      parseAttribute(InvalidLiteral, available, 'attr', 'MyModel')
    }
    expect(callingParse).to.throw(/Invalid Type/)
  })
  
  it('should parse string literals', function() {
    let attr = parseAttribute('String', available, 'attr', 'MyModel')
    expect(attr).to.exist
  })
  
  it('should fail for invalid string literals types', function() {
    let callingParse = () => {
      parseAttribute('Invalid', available, 'attr', 'MyModel')
    }
    expect(callingParse).to.throw()
  })
  
  it('should parse typed objects', function() {
  
    let raw = { type: 'String' }
    let attr = parseAttribute(raw, available, 'attr', 'MyModel')
    expect(attr).to.exist
  })
  
  it('should set name, model & options on new attribute', function() {
    let raw = { type: String, someProp: 'B' }
    let attr = parseAttribute(raw, available, 'myAttr', 'MyModel')
    expect(attr.name).to.equal('myAttr')
    expect(attr.model).to.equal('MyModel')
    expect(attr.options).to.have.property('someProp').to.equal('B')
  })
  
  it('should fail if no type passed', function() {
    let raw = { someProp: 'C' }
    let callingParse = () => {
      parseAttribute(raw, available, 'myAttr', 'MyModel')
    }
    expect(callingParse).to.throw(/Could not determine type/)
  })
  
  
})
