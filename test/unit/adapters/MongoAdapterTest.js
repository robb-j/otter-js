const expect = require('chai').expect
const MongoInMemory = require('mongo-in-memory')
const { MongoClient, ObjectID } = require('mongodb')
const MongoAdapter = require('../../../lib/adapters/MongoAdapter')
const Otter = require('../../../lib/Otter')

const { ObjectIDAttribute, HasOneAttribute } = require('../../../lib/attributes')

class TestModel extends Otter.Types.Model {
  static attributes() { return { name: String, age: Number } }
}

describe('MongoAdapter', function() {
  
  let memServer, dbUrl
  let dbIndex = 0
  let testAdapter
  
  /* Test Lifecycle */
  before(async function() {
    // Start an in-memory mongo on port 8008
    memServer = new MongoInMemory(8008)
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
      /* eslint-disable no-new */
      let createInvalidAdapter = () => { new MongoAdapter() }
      expect(createInvalidAdapter).to.throw(/requires a 'url'/)
    })
    it('should set db to null', function() {
      let a = new MongoAdapter({ url: 'invalid_url' })
      expect(a).to.have.property('db').that.equals(null)
    })
  })
  
  describe('#setup', function() {
    it('should store the db', function() {
      expect(testAdapter.db).to.exist
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
      expect(r.id).to.equal('a')
    })
    it('should unpack _createdAt', function() {
      expect(r.createdAt).to.equal('b')
    })
    it('should unpack _updatedAt', function() {
      expect(r.updatedAt).to.equal('c')
    })
    it('should remove _id', function() {
      expect(r._id).to.equal(undefined)
    })
    it('should remove _createdAt', function() {
      expect(r._createdAt).to.equal(undefined)
    })
    it('should remove _updatedAt', function() {
      expect(r._updatedAt).to.equal(undefined)
    })
  })
  
  describe('#packRecord', function() {
    
    let r
    beforeEach(function() {
      let fakeSchema = {}
      r = { id: 'a', createdAt: 'b', updatedAt: 'c' }
      testAdapter.packRecord(r, fakeSchema)
    })
    
    it('should pack id', function() {
      expect(r._id).to.equal('a')
    })
    it('should pack createdAt', function() {
      expect(r._createdAt).to.equal('b')
    })
    it('should pack updatedAt', function() {
      expect(r._updatedAt).to.equal('c')
    })
    it('should remove id', function() {
      expect(r.id).to.equal(undefined)
    })
    it('should remove createdAt', function() {
      expect(r.createdAt).to.equal(undefined)
    })
    it('should remove updatedAt', function() {
      expect(r.updatedAt).to.equal(undefined)
    })
    it('should map ObjectID attributes', async function() {
      let schema = { name: new ObjectIDAttribute('name', 'ModelName') }
      let record = { name: '5a0caa5ec4de7f00364f3032' }
      testAdapter.packRecord(record, schema)
      expect(record.name).to.be.instanceof(ObjectID)
    })
    it('should map HasOne attributes', async function() {
      let schema = { name: new HasOneAttribute('name', 'ModelName') }
      let record = { name: '5a0caa5ec4de7f00364f3032' }
      testAdapter.packRecord(record, schema)
      expect(record.name).to.be.instanceof(ObjectID)
    })
  })
  
  describe('#prepareRecordForCreate', function() {
    
    it('should add _createdAt', function() {
      let record = {}
      testAdapter.prepareRecordForCreate(record)
      expect(record).to.have.property('_createdAt')
    })
    it('should add _updatedAt', function() {
      let record = {}
      testAdapter.prepareRecordForCreate(record)
      expect(record).to.have.property('_updatedAt')
    })
  })
  
  describe('#prepareRecordForUpdate', function() {
    it('should remove reserved values', async function() {
      let record = { id: 1001, createdAt: new Date(), updatedAt: new Date() }
      testAdapter.prepareRecordForUpdate(record)
      expect(record.id).to.equal(undefined)
      expect(record.createdAt).to.equal(undefined)
      expect(record.updatedAt).to.equal(undefined)
    })
    it('should add an _updatedAt', async function() {
      let record = {}
      testAdapter.prepareRecordForUpdate(record)
      expect(record).to.have.property('_updatedAt')
    })
  })
  
  describe('#guardQuery', function() {
    
    it('should fail if not setup', async function() {
      let adapter = new MongoAdapter({ url: 'invalid_url' })
      let callingGuard = () => { adapter.guardQuery('TestModel') }
      expect(callingGuard).to.throw(/Cannot query until setup/)
    })
    it('should fail for unknown Models', async function() {
      let callingGuard = () => { testAdapter.guardQuery('UnknownModel') }
      expect(callingGuard).to.throw(/unknown Model/)
    })
  })
  
  
  /* Adapter Interface Tests */
  describe('#create', function() {
    it('should return the new records', async function() {
      let records = await testAdapter.create('TestModel', [ {name: 'Geoff'} ])
      expect(records).to.have.lengthOf(1)
    })
    it('should set fields onto records', async function() {
      let records = await testAdapter.create('TestModel', [ {name: 'Geoff'} ])
      expect(records[0]).to.have.property('name').that.equals('Geoff')
    })
    it('should set id onto records', async function() {
      let records = await testAdapter.create('TestModel', [ {name: 'Geoff'} ])
      expect(records[0]).to.have.property('id')
    })
    it('should set createdAt onto records', async function() {
      let records = await testAdapter.create('TestModel', [ {name: 'Geoff'} ])
      expect(records[0]).to.have.property('createdAt')
    })
    it('should set updatedAt onto records', async function() {
      let records = await testAdapter.create('TestModel', [ {name: 'Geoff'} ])
      expect(records[0]).to.have.property('updatedAt')
    })
    it('should persist records', async function() {
      await testAdapter.create('TestModel', [ {name: 'Geoff'} ])
      let db = await MongoClient.connect(dbUrl)
      let records = await db.collection('TestModel').find().toArray()
      expect(records).to.have.lengthOf(1)
    })
  })
  
  describe('#find', function() {
    
    let models
    beforeEach(async function() {
      models = await TestModel.create([
        { name: 'Geoff' },
        { name: 'Mark' },
        { name: 'Trevor' },
        { name: 'John' }
      ])
    })
    
    it('should return matches', async function() {
      let records = await testAdapter.find('TestModel', { name: 'Mark' })
      expect(records).to.have.lengthOf(1)
      expect(records[0]).to.have.property('name').that.equals('Mark')
    })
    it('should apply limits', async function() {
      let query = { name: /r/ }
      let opts = { limit: 1 }
      let records = await testAdapter.find('TestModel', query, opts)
      expect(records).to.have.lengthOf(1)
    })
    it('should match ids', async function() {
      
      let id = models[0].id
      let model = (await testAdapter.find('TestModel', { id }))[0]
      expect(model).to.exist
    })
  })
  
  describe('#update', function() {
    
    let models
    beforeEach(async function() {
      models = await TestModel.create([
        { name: 'Geoff', age: 7 },
        { name: 'Mark', age: 21 },
        { name: 'Trevor', age: 19 },
        { name: 'John', age: 32 }
      ])
    })
    
    it('should return the number of updated records', async function() {
      let query = { name: /o/ }
      let n = await testAdapter.update('TestModel', query, { age: 42 })
      expect(n).to.equal(3)
    })
    it('should update a single record', async function() {
      let query = { name: 'Geoff' }
      await testAdapter.update('TestModel', query, { age: 8 })
      let models = await testAdapter.find('TestModel', query)
      expect(models[0]).to.have.property('age').that.equals(8)
    })
    it('should update multiple records', async function() {
      let q = { name: /o/ }
      await testAdapter.update('TestModel', q, { age: 42 })
      let models = await testAdapter.find('TestModel', q)
      
      expect(models[0]).to.have.property('age').that.equals(42)
      expect(models[1]).to.have.property('age').that.equals(42)
      expect(models[2]).to.have.property('age').that.equals(42)
    })
    it('should set the updatedAt on records', async function() {
      let before = models[0].updatedAt
      await new Promise(resolve => setTimeout(resolve, 10))
      await testAdapter.update('TestModel', { }, { age: 42 })
      let after = (await testAdapter.find('TestModel'))[0].updatedAt
      
      expect(after).to.not.deep.equal(before)
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
      expect(models).to.have.lengthOf(0)
    })
    it('should remove multiple records', async function() {
      let q = { name: /o/ }
      await testAdapter.destroy('TestModel', q)
      let models = await testAdapter.find('TestModel')
      expect(models).to.have.lengthOf(1)
    })
    it('should return the number of deleted records', async function() {
      let q = { name: /o/ }
      let n = await testAdapter.destroy('TestModel', q)
      expect(n).to.equal(3)
    })
  })
  
  
  
  /* Query Processing */
  describe('#genMongoQuery', function() {
    it('should process to mongo query', async function() {
      let query = new Otter.Types.Query('TestModel', { name: 'Mark' })
      query.prepareForSchema(TestModel.schema)
      let mq = testAdapter.genMongoQuery(query)
      
      expect(mq).to.have.property('name').that.equals('Mark')
    })
    it('should move id to _id', async function() {
      let query = new Otter.Types.Query('TestModel', { id: '1234' })
      query.prepareForSchema(TestModel.schema)
      let mq = testAdapter.genMongoQuery(query)
      expect(mq).to.not.have.property('id')
      expect(mq).to.have.property('_id')
    })
    it('should move createdAt to _createdAt', async function() {
      let query = new Otter.Types.Query('TestModel', { createdAt: new Date() })
      query.prepareForSchema(TestModel.schema)
      let mq = testAdapter.genMongoQuery(query)
      expect(mq).to.not.have.property('createdAt')
      expect(mq).to.have.property('_createdAt')
    })
    it('should move updatedAt to _updatedAt', async function() {
      let query = new Otter.Types.Query('TestModel', { updatedAt: new Date() })
      query.prepareForSchema(TestModel.schema)
      let mq = testAdapter.genMongoQuery(query)
      expect(mq).to.not.have.property('updatedAt')
      expect(mq).to.have.property('_updatedAt')
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
      query.prepareForSchema(TestModel.schema)
      testAdapter.evaluateExpr(attr, query.processed.name)
      expect(called).to.equal(true)
    })
    it('should fail for invalid expressions', async function() {
      let attr = TestModel.schema.name
      let expr = { type: 'unknown' }
      
      try {
        await testAdapter.evaluateExpr(attr, expr)
        expect.fail('Should throw')
      }
      catch (error) {
        expect(error).matches(/Unsupported expression/)
      }
    })
  })
  
})
