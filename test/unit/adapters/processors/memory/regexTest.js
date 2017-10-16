const expect = require('chai').expect
const regex = require('../../../../../lib/adapters/processors/memory/regex')

describe('RegexMemoryProcessor', function() {
  it('should fail if regex is false', function() {
    let result = regex(/test/, 'Test')
    expect(result).to.equal(false)
  })
  it('should pass if regex is true', function() {
    let result = regex(/test/i, 'Test')
    expect(result).to.equal(true)
  })
})
