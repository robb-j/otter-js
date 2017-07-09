const assert = require('assert')
const comparison = require('../../../../lib/adapters/processors/memory/comparison')

describe('ComparisonMemoryProcessor', function() {
  it('should fail for invalid comparisons', function() {
    let expr = {}
    let value = 7
    assert.equal(comparison(expr, value), false)
  })
  it('should match < operators', function() {
    let expr = { '<': 10 }
    let value = 7
    assert.equal(comparison(expr, value), true)
  })
  it('should match <= operators', function() {
    let expr = { '<=': 7 }
    let value = 7
    assert.equal(comparison(expr, value), true)
  })
  it('should match > operators', function() {
    let expr = { '>': 5 }
    let value = 7
    assert.equal(comparison(expr, value), true)
  })
  it('should match >= operators', function() {
    let expr = { '>=': 7 }
    let value = 7
    assert.equal(comparison(expr, value), true)
  })
})
