const expect = require('chai').expect
const assert = require('assert')
const MongoAdapter = require('../../lib/adapters/MongoAdapter')
const MongoInMemory = require('mongo-in-memory')
const MongoClient = require('mongodb').MongoClient
const Otter = require('../../lib/Otter')

class TestModel extends Otter.Types.Model {
  static attributes() { return { name: String, age: Number } }
}

describe('MongoAdapter', function() {
  
  let memServer, dbUrl
  let dbIndex = 0
  let testAdapter
  
  /* Test Lifecycle */
  before(async function() {
    // Start an in-memory mongo on port 8080
    memServer = new MongoInMemory(8080)
    await memServer.start()
  })
  
  after(async function() {
    // Close the in-memory mongo
    await memServer.stop()
  })
  
  beforeEach(async function() {
    
    // Create a mongo adapter using our in-memory db
    dbUrl = memServer.getMongouri(`adapter_test_${dbIndex++}`)
    testAdapter = new MongoAdapter({ url: dbUrl })
    
    // Start up Otter
    await Otter.extend()
      .addAdapter(testAdapter)
      .addModel(TestModel)
      .start()
  })
  
  afterEach(async function() {
    // Stop Otter?
  })
  
  
  /* Lifecycle Tests */
  describe('#constructor', function() {
    it('should require a url', function() {
      assert.throws(() => {
        let a = new MongoAdapter()
      }, /requires a 'url'/)
    })
    it('should set db to null', function() {
      let a = new MongoAdapter({ url: 'invalid_url' })
      assert.equal(a.db, null)
    })
  })
  
  describe('#setup', function() {
    it('should store the db', function() {
      assert(testAdapter.db)
    })
  })
  
  describe('#supportsAttribute', function() {
    // TODO: ...
  })
  
  
  /** Util Tests */
  describe('#unpackRecord', function() {
    let r
    
    beforeEach(function() {
      r = { _id: 'a', _createdAt: 'b', _updatedAt: 'c' }
      testAdapter.unpackRecord(r)
    })
    
    it('should unpack _id', function() {
      assert.equal(r.id, 'a')
    })
    it('should unpack _createdAt', function() {
      assert.equal(r.createdAt, 'b')
    })
    it('should unpack _updatedAt', function() {
      assert.equal(r.updatedAt, 'c')
    })
    it('should remove _id', function() {
      assert.equal(r._id, undefined)
    })
    it('should remove _createdAt', function() {
      assert.equal(r._createdAt, undefined)
    })
    it('should remove _updatedAt', function() {
      assert.equal(r._updatedAt, undefined)
    })
  })
  
  describe('#packRecord', function() {
    let r
    
    beforeEach(function() {
      r = { id: 'a', createdAt: 'b', updatedAt: 'c' }
      testAdapter.packRecord(r)
    })
    
    it('should pack id', function() {
      assert.equal(r._id, 'a')
    })
    it('should pack createdAt', function() {
      assert.equal(r._createdAt, 'b')
    })
    it('should pack updatedAt', function() {
      assert.equal(r._updatedAt, 'c')
    })
    it('should remove id', function() {
      assert.equal(r.id, undefined)
    })
    it('should remove createdAt', function() {
      assert.equal(r.createdAt, undefined)
    })
    it('should remove updatedAt', function() {
      assert.equal(r.updatedAt, undefined)
    })
  })
  
  describe('#prepareValuesForCreate', function() {
    
    it('should add _createdAt', function() {
      let vals = testAdapter.prepareValuesForCreate({})
      assert(vals._createdAt)
    })
    it('should add _updatedAt', function() {
      let vals = testAdapter.prepareValuesForCreate({})
      assert(vals._updatedAt)
    })
  })
  
  describe('#guardQuery', function() {
    
    it('should fail if not setup', async function() {
      let adapter = new MongoAdapter({ url: 'invalid_url' })
      assert.throws(() => {
        adapter.guardQuery('TestModel')
      }, /Cannot query until setup/)
    })
    it('should fail for unknown Models', async function() {
      assert.throws(() => {
        testAdapter.guardQuery('UnknownModel')
      }, /unknown Model/)
    })
  })
  
  
  /* Adapter Interface Tests */
  describe('#create', function() {
    it('should return the new records', async function() {
      let records = await testAdapter.create('TestModel', [ {name: 'Geoff'} ])
      assert.equal(records.length, 1)
    })
    it('should set fields onto records', async function() {
      let records = await testAdapter.create('TestModel', [ {name: 'Geoff'} ])
      assert.equal(records[0].name, 'Geoff')
    })
    it('should set id onto records', async function() {
      let records = await testAdapter.create('TestModel', [ {name: 'Geoff'} ])
      assert(records[0].id)
    })
    it('should set createdAt onto records', async function() {
      let records = await testAdapter.create('TestModel', [ {name: 'Geoff'} ])
      assert(records[0].createdAt)
    })
    it('should set updatedAt onto records', async function() {
      let records = await testAdapter.create('TestModel', [ {name: 'Geoff'} ])
      assert(records[0].updatedAt)
    })
    it('should persist records', async function() {
      await testAdapter.create('TestModel', [ {name: 'Geoff'} ])
      let db = await MongoClient.connect(dbUrl)
      let records = await db.collection('TestModel').find().toArray()
      assert.equal(records.length, 1)
    })
  })
  
  describe('#find', function() {
    beforeEach(async function() {
      await TestModel.create([
        { name: 'Geoff' },
        { name: 'Mark' },
        { name: 'Trevor' },
        { name: 'John' }
      ])
    })
    
    it('should return matches', async function() {
      let records = await testAdapter.find('TestModel', { name: 'Mark' })
      assert(records)
      assert(records[0])
      assert(records[0].name)
      assert.equal(records[0].name, 'Mark')
    })
    it('should apply limits', async function() {
      let query = { name: /r/ }
      let opts = { limit: 1 }
      let records = await testAdapter.find('TestModel', query, opts)
      assert(records)
      assert.equal(records.length, 1)
    })
  })
  
  describe('#update', function() {
    beforeEach(async function() {
      await TestModel.create([
        { name: 'Geoff', age: 7 },
        { name: 'Mark', age: 21 },
        { name: 'Trevor', age: 19 },
        { name: 'John', age: 32 }
      ])
    })
    
    it('should return the number of updated records', async function() {
      let q = { name: /o/ }
      let n = await testAdapter.update('TestModel', q, { age: 42 })
      assert.equal(n, 3)
    })
    it('should update a single record', async function() {
      let q = { name: 'Geoff' }
      await testAdapter.update('TestModel', q, { age: 8 })
      let models = await testAdapter.find('TestModel', q)
      assert(models[0])
      assert.equal(models[0].age, 8)
    })
    it('should update multiple records', async function() {
      let q = { name: /o/ }
      await testAdapter.update('TestModel', q, { age: 42 })
      let models = await testAdapter.find('TestModel', q)
      assert.equal(models.length, 3)
      assert.equal(models[0].age, 42)
      assert.equal(models[1].age, 42)
      assert.equal(models[2].age, 42)
    })
  })
  
  describe('#destroy', function() {
    beforeEach(async function() {
      await TestModel.create([
        { name: 'Geoff', age: 7 },
        { name: 'Mark', age: 21 },
        { name: 'Trevor', age: 19 },
        { name: 'John', age: 32 }
      ])
    })
    
    it('should remove a single record', async function() {
      let q = { name: 'Geoff' }
      await testAdapter.destroy('TestModel', q)
      let models = await testAdapter.find('TestModel', q)
      assert.equal(models.length, 0)
    })
    it('should remove multiple records', async function() {
      let q = { name: /o/ }
      await testAdapter.destroy('TestModel', q)
      let models = await testAdapter.find('TestModel')
      assert.equal(models.length, 1)
    })
    it('should return the number of deleted records', async function() {
      let q = { name: /o/ }
      let n = await testAdapter.destroy('TestModel', q)
      assert.equal(n, 3)
    })
  })
  
  
  
  /* Query Processing */
  describe('#genMongoQuery', function() {
    it('should process to mongo query', async function() {
      let query = new Otter.Types.Query('TestModel', { name: 'Mark' })
      query.validateOn(TestModel.schema)
      let mq = testAdapter.genMongoQuery(query)
      assert(mq)
      assert(mq.name)
      assert.equal(mq.name, 'Mark')
    })
  })
  
  describe('#evaluateExpr', function() {
    it('should use processors', async function() {
      let called = false
      testAdapter.processors.equality = (a, b) => {
        called = true
      }
      let attr = TestModel.schema.name
      let query = new Otter.Types.Query('TestModel', { name: 'Mark' })
      query.validateOn(TestModel.schema)
      testAdapter.evaluateExpr(attr, query.processed.name)
      assert(called)
    })
    it('should fail for invalid expressions', async function() {
      let attr = TestModel.schema.name
      let expr = { type: 'unknown' }
      assert.throws(() => {
        testAdapter.evaluateExpr(attr, expr)
      }, /Unsupported expression/)
    })
  })
})
