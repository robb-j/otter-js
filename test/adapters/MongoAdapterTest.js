const assert = require('assert')
const assExt = require('../assertExtension')
const MongoAdapter = require('../../lib/adapters/MongoAdapter')
const MongoInMemory = require('mongo-in-memory')
const MongoClient = require('mongodb').MongoClient
const Otter = require('../../lib/Otter')

class TestModel extends Otter.Types.Model {
  static attributes() { return { name: String } }
}

describe.only('MongoAdapter', function() {
  
  let memServer, dbUrl
  let dbIndex = 0
  let testAdapter, TestOtter
  
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
    TestOtter = await Otter.extend()
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
})
