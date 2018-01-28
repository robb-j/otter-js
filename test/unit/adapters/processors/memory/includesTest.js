const expect = require('chai').expect
const includesProc = require('../../../../../lib/adapters/processors/memory/includes')

describe('IncludesMemoryProcessor', function() {
  
  let value = [
    { x: 7 }, { x: 9 }, { x: 3 }
  ]
  
  let boundIncludes
  beforeEach(async function() {
    boundIncludes = includesProc.bind({
      evaluateExpr(expr, elem) { return expr === elem }
    })
  })
  
  it('should pass if any element matches', async function() {
    let result = boundIncludes({ x: 7 }, value)
    expect(result).to.equal(true)
  })
  it('should fail if no elements match', async function() {
    let result = boundIncludes({ x: 6 }, value)
    expect(result).to.equal(false)
  })
})
