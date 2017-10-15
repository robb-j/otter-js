const expect = require('chai').expect
const comparison = require('../../../../lib/adapters/processors/memory/comparison')

describe('ComparisonMemoryProcessor', function() {
  it('should fail for invalid comparisons', function() {
    let result = comparison({}, 7)
    expect(result).to.equal(false)
  })
  it('should match < operators', function() {
    let result = comparison({ '<': 10 }, 7)
    expect(result).to.equal(true)
  })
  it('should match <= operators', function() {
    let result = comparison({ '<=': 7 }, 7)
    expect(result).to.equal(true)
  })
  it('should match > operators', function() {
    let result = comparison({ '>': 5 }, 7)
    expect(result).to.equal(true)
  })
  it('should match >= operators', function() {
    let result = comparison({ '>=': 7 }, 7)
    expect(result).to.equal(true)
  })
})
