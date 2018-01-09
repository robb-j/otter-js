const expect = require('chai').expect
const has = require('../../../../../lib/adapters/processors/mongo/has')


describe('HasMongoProcessor', function() {

  let boundHas
  beforeEach(async function() {
    boundHas = has.bind({
      evaluateExpr(subkey, expr) {
        return { [subkey]: true }
      }
    })
  })


  it('should proceses', async function() {
    let result = boundHas('other', null, { name: 'Geoff' })
    expect(result).to.deep.equal({
      'other.name': true
    })
  })
})
