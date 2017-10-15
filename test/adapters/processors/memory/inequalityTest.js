const expect = require('chai').expect
const not = require('../../../../lib/adapters/processors/memory/inequality')

describe('InequalityMemoryProcessor', function() {
  it('should fail if equal', function() {
    let result = not({ '!': 7 }, 7)
    expect(result).to.equal(false)
  })
  it('should pass if not equal', function() {
    let result = not({ '!': 7 }, 9)
    expect(result).to.equal(true)
  })
})
