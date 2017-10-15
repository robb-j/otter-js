const expect = require('chai').expect
const inList = require('../../../../lib/adapters/processors/memory/inList')

describe('InListMemoryProcessor', function() {
  it('should fail if not in list', function() {
    let result = inList([1, 2, 3, 7], 5)
    expect(result).to.equal(false)
  })
  it('should pass if in list', function() {
    let result = inList([ 1, 3, 7 ], 7)
    expect(result).to.equal(true)
  })
})
