const expect = require('chai').expect
const includes = require('../../../../../lib/adapters/processors/mongo/includes')


describe('IncludesMongoProcessor', function() {

  let boundIncludes
  beforeEach(async function() {
    boundIncludes = includes.bind({
      evaluateExpr(subkey, expr) {
        return { [subkey]: true }
      }
    })
  })


  it('should proceses', async function() {
    let result = boundIncludes('other', null, { name: 'Geoff' })
    expect(result).to.deep.equal({
      other: {
        $elemMatch: { name: true }
      }
    })
  })
})
