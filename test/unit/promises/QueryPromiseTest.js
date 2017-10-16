const expect = require('chai').expect
const QueryPromise = require('../../../lib/promises/QueryPromise')
const Otter = require('../../../lib/Otter')

describe('QueryPromise', function() {
  
  let query, promise
  
  beforeEach(async function() {
    query = new Otter.Types.Query('TestModel')
    promise = new QueryPromise((resolve) => {
      resolve()
    }, query)
  })
  
  describe('#constructor', function() {
    it('should set the query', async function() {
      expect(promise.query).to.equal(query)
    })
  })
  
  describe('#limit', function() {
    it('should set the limit on the query', async function() {
      promise.limit(5)
      expect(query.limit).to.equal(5)
    })
    it('should be chainable', async function() {
      let returned = promise.limit(5)
      expect(returned).to.equal(promise)
    })
  })
  
  describe('#where', function() {
    it('should add a single clause', async function() {
      promise.where('cat', 'black')
      expect(query.where.cat).to.equal('black')
    })
    it('should add multiple clauses', async function() {
      promise.where({ cat: 'black', age: 5 })
      expect(query.where.cat).to.equal('black')
      expect(query.where.age).to.equal(5)
    })
    it('should fail for unknown arguements', async function() {
      let addingClause = () => { promise.where(9) }
      expect(addingClause).to.throw(/Incorrect Arguements/)
    })
    it('should be chainable', async function() {
      let returned = promise.where({})
      expect(returned).to.equal(promise)
    })
  })
  
})
