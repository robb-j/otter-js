const assert = require('assert')
const Query = require('../lib/Query')

describe('Query', function() {
  
  describe('#constructor', function() {
    
    it('should set the modelName', function() {
      let q = new Query('Model', {})
      assert.equal(q.modelName, 'Model')
    })
    
    it('should initialize properties', function() {
      let q = new Query('Model', {})
      assert.deepEqual(q.where, {})
      assert.equal(q.sort, null)
      assert.equal(q.limit, null)
      assert.equal(q.pluck, null)
    })
    
    it('should have a default value for where', function() {
      let q = new Query('Model')
      assert(q.where)
    })
    
    it('should construct where using string id shorthand', function() {
      let q = new Query('Model', '7')
      assert.equal(q.where.id, '7')
    })
    
    it('should construct where using number id shorthand', function() {
      let q = new Query('Model', 7)
      assert.equal(q.where.id, 7)
    })
    
    it('should construct where using array of ids', function() {
      let q = new Query('Model', ['1', '2'])
      assert.deepEqual(q.where.id, ['1', '2'])
    })
    
    it('should construct where using where shorthand', function() {
      let q = new Query('Model', { a: 100 })
      assert.equal(q.where.a, 100)
    })
    
    it('should deconstruct reserved keys', function() {
      let q = new Query('Model', {
        where: 'a', sort: 'b', limit: 'c', pluck: 'd'
      })
      assert.equal(q.where, 'a')
      assert.equal(q.sort, 'b')
      assert.equal(q.limit, 'c')
      assert.equal(q.pluck, 'd')
    })
    
  })
})
