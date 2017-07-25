const assert = require('assert')
const assExt = require('../assertExtension')
const MongoAdapter = require('../../lib/adapters/MongoAdapter')
const Otter = require('../../lib/Otter')

class TestModel extends Otter.Types.Model {
  static attributes() { return { name: String } }
}

class MockMongoAdapter extends MongoAdapter {
  
}

describe.only('MongoAdapter', function() {
  
  // let testAdapter, TestOtter
  //
  // beforeEach(async function() {
  //   testAdapter = new MongoAdapter()
  //   console.log(this)
  //
  //   TestOtter = await Otter.extend().use(o => {
  //     o.addAdapter(testAdapter)
  //     o.addModel(TestModel)
  //   })
  // })
  
  
  describe('#constructor', function() {
    
    it('should require a url', function() {
      assert.throws(() => {
        let a = new MongoAdapter()
      }, /requires a 'url'/)
    })
    it('should setup properties', function() {
      let a = new MongoAdapter({ url: 'invalid_url' })
      assert.equal(a.client, null)
      assert.equal(a.db, null)
    })
  })
  
})
