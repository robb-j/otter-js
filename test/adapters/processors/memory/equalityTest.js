const expect = require('chai').expect
const equalProc = require('../../../../lib/adapters/processors/memory/equality')

describe('EqualityMemoryProcessor', function() {
  it('should fail if unequal', function() {
    let result = equalProc(9, 7)
    expect(result).to.equal(false)
  })
  it('should pass if equal', function() {
    let result = equalProc(7, 7)
    expect(result).to.equal(true)
  })
})
