const expect = require('chai').expect
const Otter = require('../../lib')
const MemoryAdapter = require('../../lib/adapters/MemoryAdapter')

const { asyncError, makeModel } = require('../utils')


describe('Model', function() {
  
  let TestModel, adapter
  beforeEach(async function() {
    adapter = new MemoryAdapter()
    // TestModel = class extends BaseTestModel { }
    TestModel = makeModel('TestModel', { name: String })
    await Otter.extend()
      .addModel(TestModel)
      .addAdapter(adapter)
      .start()
  })
  
  
  
  /* * * STATIC PROPERTIES * * */
  
  describe('::collectAttributes', function() {
    it('should add its own attributes', async function() {
      let attrs = TestModel.collectAttributes(adapter)
      expect(attrs).to.have.property('name')
    })
    it('should add the adapters default attributes', async function() {
      let attrs = TestModel.collectAttributes(adapter)
      expect(attrs).to.have.property('id')
      expect(attrs).to.have.property('createdAt')
      expect(attrs).to.have.property('updatedAt')
    })
  })
  
  
  
  /* * * STATIC QUERYING * * */
  
  describe('::create', function() {
    it('should create a new record', async function() {
      let geoff = await TestModel.create({ name: 'Geoff' })
      expect(geoff).to.have.property('name').that.equals('Geoff')
    })
    it('should create multiple records', async function() {
      let models = await TestModel.create([
        { name: 'Tom' },
        { name: 'Bob' }
      ])
      expect(models).to.be.an('array').that.has.lengthOf(2)
    })
  })
  
  describe('::find', function() {
    beforeEach(async function() {
      await TestModel.create([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
    })
    it('should return matching models', async function() {
      let matches = await TestModel.find({name: 'Terrance'})
      expect(matches).to.have.lengthOf(1)
      expect(matches[0].name).to.equal('Terrance')
    })
    it('should use options', async function() {
      let matches = await TestModel.find({}, { limit: 1 })
      expect(matches).to.have.lengthOf(1)
    })
    it('should be chainable', async function() {
      let matches = await TestModel.find().limit(1)
      expect(matches).to.have.lengthOf(1)
    })
  })
  
  describe('::findOne', function() {
    beforeEach(async function() {
      await TestModel.create([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
    })
    it('should return the first match', async function() {
      let geoff = await TestModel.findOne()
      expect(geoff).to.have.property('name').that.equals('Geoff')
    })
    it('should be an instance of the model', async function() {
      let geoff = await TestModel.findOne()
      expect(geoff).to.be.instanceOf(TestModel)
    })
    it('should be chainable', async function() {
      let geoff = await TestModel.findOne()
        .where('name', 'Geoff')
      expect(geoff).to.exist
    })
  })
  
  describe('::count', function() {
    beforeEach(async function() {
      await TestModel.create([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
    })
    it('should count the models', async function() {
      let count = await TestModel.count()
      expect(count).to.equal(2)
    })
    it('should count with queries', async function() {
      let count = await TestModel.count({ name: 'Geoff' })
      expect(count).to.equal(1)
    })
  })
  
  describe('::destroy', function() {
    beforeEach(async function() {
      await TestModel.create([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
    })
    it('should remove matching models', async function() {
      let deleted = await TestModel.destroy('all')
      expect(deleted).to.equal(2)
    })
    it('should use options', async function() {
      let deleted = await TestModel.destroy('all', { limit: 1 })
      expect(deleted).to.equal(1)
    })
    it('should be chainable', async function() {
      let deleted = await TestModel.destroy('all').limit(1)
      expect(deleted).to.equal(1)
    })
    it('should fail for empty queries', async function() {
      let error = await asyncError(() => TestModel.destroy())
      expect(error.code).to.equal('model.destroyGuard')
    })
  })
  
  describe('::update', function() {
    beforeEach(async function() {
      await TestModel.create([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
    })
    
    it('should update all records', async function() {
      await TestModel.update('all', { name: 'Bob' })
      let models = await TestModel.find()
      expect(models[0].name).to.equal('Bob')
      expect(models[1].name).to.equal('Bob')
    })
    it('should update matching records', async function() {
      await TestModel.update('2', { name: 'Bob' })
      let models = await TestModel.find()
      expect(models[0].name).to.equal('Geoff')
      expect(models[1].name).to.equal('Bob')
    })
    it('should use options', async function() {
      await TestModel.update('all', { name: 'Bob' }, { limit: 1 })
      let models = await TestModel.find()
      expect(models[0].name).to.equal('Bob')
      expect(models[1].name).to.equal('Terrance')
    })
    it('should be chainable', async function() {
      await TestModel.update('all', { name: 'Bob' }).limit(1)
      let models = await TestModel.find()
      expect(models[0].name).to.equal('Bob')
      expect(models[1].name).to.equal('Terrance')
    })
    it('should fail for empty queries', async function() {
      let error = await asyncError(() => TestModel.update({}, { name: 'Tim' }))
      expect(error.code).to.equal('model.updateGuard')
    })
  })
  
  
  
  /* * * INSTANCE PROPERTIES * * */
  
  describe('#modelName', function() {
    it('should return the name of the model', function() {
      let m = new TestModel()
      expect(m.modelName).to.equal('TestModel')
    })
  })
  
  describe('#exists', function() {
    it('should be true when model is created', async function() {
      let m = await TestModel.create({ name: 'Geoff' })
      expect(m.exists).to.equal(true)
    })
    it('should be false when model is not created', function() {
      let m = new TestModel({ name: 'Geoff' })
      expect(m.exists).to.equal(false)
    })
  })
  
  
  
  /* * * INSTANCE METHODS * * */
  
  describe('#save', function() {
    it('should add a model to the store', async function() {
      let m = new TestModel({ name: 'Geoff' })
      await m.save()
      expect(m.adapter.store.TestModel[1].name).to.equal('Geoff')
    })
    it('should set the id on new models', async function() {
      let m = new TestModel({ name: 'Geoff' })
      await m.save()
      expect(m.id).to.equal('1')
    })
    it('should update existing models', async function() {
      
      let m = await TestModel.create({ name: 'Geoff' })
      m.name = 'Terrance'
      
      await m.save()
      
      expect(m.adapter.store.TestModel[1].name).to.equal('Terrance')
    })
    it('should fail updating a model that does not exist', async function() {
      let m = new TestModel({ id: '1', name: 'Geoff' })
      let error = await asyncError(() => m.save())
      expect(error.code).to.equal('model.saveFailed')
    })
  })
  
  describe('#destroy', function() {
    it('should remove the model', async function() {
      
      let m = await TestModel.create({ name: 'Geoff' })
      await m.destroy()
      
      let found = await TestModel.findOne('1')
      expect(found).to.be.null
    })
    it('should fail if the model isn\'t created yet', async function() {
      let m = new TestModel({ name: 'Geoff' })
      let error = await asyncError(() => m.destroy())
      expect(error.code).to.equal('model.cannotDestroy')
    })
    it('should fail if model does not exist', async function() {
      
      let m = new TestModel({ id: '1', name: 'Geoff' })
      
      let error = await asyncError(() => m.destroy())
      expect(error.code).to.equal('model.destroyFailed')
    })
  })
  
})
