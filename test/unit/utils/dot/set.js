const expect = require('chai').expect
const setUsingDot = require('../../../../lib/utils/dot/set')

describe('#setUsingDot', function() {
  
  it('should set without dots', async function() {
    let object = { }
    setUsingDot(object, 'a', 'b')
    expect(object).to.have.property('a', 'b')
  })
  
  it('should set with dots', async function() {
    let object = { }
    setUsingDot(object, 'a.b', 42)
    expect(object.a).to.have.property('b', 42)
  })
  
  it('should set with existing intermediate objects', async function() {
    let object = { a: { b: 42 } }
    setUsingDot(object, 'a.c', true)
    expect(object.a).to.have.property('c', true)
  })
})
