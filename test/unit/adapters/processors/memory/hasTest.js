const expect = require('chai').expect
const hasProc = require('../../../../../lib/adapters/processors/memory/has')

describe('HasMemoryProcessor', function() {
  
  let boundHas
  beforeEach(async function() {
    boundHas = hasProc.bind({
      evaluateExpr(expr, value) { return expr === value }
    })
  })
  
  it('should pass if all subexpressions pass', async function() {
    let value = { x: 5, y: 9 }
    let result = boundHas({ x: 5, y: 9 }, value)
    expect(result).to.equal(true)
  })
  
  it('should fial if any subexpressions fail', async function() {
    let value = { x: 5, y: 9 }
    let result = boundHas({ x: 5, y: 2 }, value)
    expect(result).to.equal(false)
  })
  
})
