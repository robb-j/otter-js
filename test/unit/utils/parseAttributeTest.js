const expect = require('chai').expect
const parseAttribute = require('../../../lib/utils/parseAttribute')

const Attribute = require('../../../lib').Types.Attribute

const { asyncError } = require('../../utils')

const customTypes = {
  String: class extends Attribute { },
  Number: class extends Attribute { },
  Boolean: class extends Attribute { },
  Relation: class extends Attribute {
    static customNameMap() { return { relation: 'model' } }
  }
}

function parseAttrWithDefaults(attr) {
  return parseAttribute(attr, customTypes, 'myAttr', 'MyModel')
}

describe('#parseAttribute', function() {
  
  it('should parse type literals', async function() {
    let attr = parseAttrWithDefaults(String)
    expect(attr).to.be.instanceOf(customTypes.String)
  })
  
  it('should fail for invalid type literals', async function() {
    function InvalidLiteral() { }
    
    let error = await asyncError(() => parseAttrWithDefaults(InvalidLiteral))
    expect(error.code).to.equal('attr.parser.invalidType')
  })
  
  it('should parse string literals', async function() {
    let attr = parseAttrWithDefaults('String')
    expect(attr).to.exist
  })
  
  it('should fail for invalid string literals types', async function() {
    let error = await asyncError(() => parseAttrWithDefaults('Invalid'))
    expect(error.code).to.equal('attr.parser.invalidType')
  })
  
  it('should parse typed objects', async function() {
  
    let raw = { type: 'String' }
    let attr = parseAttrWithDefaults(raw)
    expect(attr).to.exist
  })
  
  it('should set name, model & options on new attribute', async function() {
    let raw = { type: String, someProp: 'B' }
    let attr = parseAttrWithDefaults(raw)
    expect(attr.name).to.equal('myAttr')
    expect(attr.modelName).to.equal('MyModel')
    expect(attr.options).to.have.property('someProp').to.equal('B')
  })
  
  it('should fail if no type passed', async function() {
    let raw = { someProp: 'C' }
    let error = await asyncError(() => parseAttrWithDefaults(raw))
    expect(error.code).to.equal('attr.parser.unknownType')
  })
  
  it('should map using customNameMap on the Attribute', async function() {
    let attr = parseAttrWithDefaults({ relation: 'Cat' })
    expect(attr).to.be.instanceOf(customTypes.Relation)
  })
  
  it('should fail for invalid custom names', async function() {
    let callingParse = () => parseAttrWithDefaults({ })
    expect(callingParse).to.throw(/Could not determine type/)
  })
  
  it('should apply mapping to options', async function() {
    let attr = parseAttrWithDefaults({ relation: 'Cat' })
    expect(attr.options).to.have.property('model').that.equals('Cat')
  })
})
