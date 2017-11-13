const expect = require('chai').expect
const getUsingDot = require('../../../lib/utils/getUsingDot')

describe('#getUsingDot', function() {
  
  let haystack = {
    simpleKey: true,
    a: { complex: { key: 'huzzar' } }
  }
  
  it('should match basic keys', async function() {
    let match = getUsingDot('simpleKey', haystack)
    expect(match).to.equal(true)
  })
  
  it('should match nested keys', async function() {
    let match = getUsingDot('a.complex.key', haystack)
    expect(match).to.equal('huzzar')
  })
  
  it('should default to null', async function() {
    let match = getUsingDot('someUnknownKey', haystack)
    expect(match).to.equal(null)
  })
})
