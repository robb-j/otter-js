const expect = require('chai').expect
const QueryPromise = require('../../../lib/promises/QueryPromise')
const Otter = require('../../../lib/Otter')

const { asyncError, makeModel } = require('../../utils')

describe('QueryPromise', function() {
  
  let query, promise, TestModel
  
  beforeEach(async function() {
    TestModel = makeModel('TestModel', { name: String })
    await Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
      .addModel(TestModel)
      .start()
    
    query = new Otter.Types.Query(TestModel)
    promise = new QueryPromise(resolve => resolve(), query)
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
      let error = await asyncError(() => promise.where(9))
      expect(error.code).to.equal('queryProm.invalidWhere')
    })
    it('should be chainable', async function() {
      let returned = promise.where({})
      expect(returned).to.equal(promise)
    })
  })
  
  describe('#first', function() {
    it('should set singular', async function() {
      promise.first()
      expect(query.singular).to.equal(true)
    })
    it('should set the limit', async function() {
      promise.first()
      expect(query.limit).to.equal(1)
    })
    it('should be chainable', async function() {
      let returned = promise.first()
      expect(returned).to.equal(promise)
    })
  })
  
})
