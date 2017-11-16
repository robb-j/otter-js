const expect = require('chai').expect
const Otter = require('../../lib/Otter')
const MemoryAdapter = require('../../lib/adapters/MemoryAdapter')

const { makeModel } = require('../utils')


// class BaseTestModel extends Otter.Types.Model {
//   constructor(values) { super(values); this.callbacks = {} }
//
//   static attributes() { return { name: String, pass: 'Secret' } }
// }

// class SubModel extends Otter.Types.Model {
//   static attributes() { return { isCool: Boolean } }
// }

class Secret extends Otter.Types.Attribute {
  get isProtected() { return true }
}

describe('Model', function() {
  
  let TestModel, SubTestModel, adapter
  beforeEach(async function() {
    adapter = new MemoryAdapter()
    // TestModel = class extends BaseTestModel { }
    TestModel = makeModel('TestModel', { name: String, pass: 'Secret' })
    SubTestModel = class extends TestModel {
      static attributes() { return { isCool: Boolean } }
    }
    await Otter.extend()
      .addModel(TestModel)
      .addModel(SubTestModel)
      .addAttribute(Secret)
      .addAdapter(adapter)
      .start()
  })
  
  
  
  /* * * STATIC PROPERTIES * * */
  
  describe('::attributes', function() {
    it('should be an empty object', async function() {
      let props = Otter.Types.Model.attributes()
      expect(props).to.deep.equal({})
    })
  })
  
  describe('::collectAttributes', function() {
    it('should add its own attributes', async function() {
      let attrs = TestModel.collectAttributes(adapter)
      expect(attrs).to.have.property('name')
      expect(attrs).to.have.property('pass')
    })
    it('should add the adapters default attributes', async function() {
      let attrs = TestModel.collectAttributes(adapter)
      expect(attrs).to.have.property('id')
      expect(attrs).to.have.property('createdAt')
      expect(attrs).to.have.property('updatedAt')
    })
    it('should merge properties with superclass', function() {
      let attrs = SubTestModel.collectAttributes(adapter)
      expect(attrs).to.have.property('name')
      expect(attrs).to.have.property('pass')
      expect(attrs).to.have.property('isCool')
    })
  })
  
  describe('::adapterName', function() {
    it('should have a default value of "default"', function() {
      expect(TestModel.adapterName()).to.equal('default')
    })
  })
  
  describe('::adapter', function() {
    it('should return the adapter when set', function() {
      let adapter = {}
      TestModel._adapter = adapter
      expect(TestModel.adapter).to.equal(adapter)
    })
  })
  
  describe('::schema', function() {
    it('should return the schema when set', function() {
      let schema = {}
      TestModel._schema = schema
      expect(TestModel.schema).to.equal(schema)
    })
  })
  
  describe('::isActive', function() {
    it('should be false by default', function() {
      class NewModel extends Otter.Types.Model {}
      expect(NewModel.isActive).to.equal(false)
    })
    it('should be true when an adapter & schema is set', function() {
      expect(TestModel.isActive).to.equal(true)
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
      console.log(matches[0].constructor.name)
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
      try {
        await TestModel.destroy()
        expect.fail('Should throw')
      }
      catch (error) {
        expect(error).matches(/Destroy Guard/)
      }
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
      await TestModel.update(2, { name: 'Bob' })
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
      try {
        await TestModel.update({}, { name: 'Tim' })
        expect.fail('Should throw')
      }
      catch (error) {
        expect(error).matches(/Update Guard/)
      }
    })
    it('should update the updatedAt date', async function() {
      
    })
  })
  
  
  
  /* * * STATIC HOOKS * * */
  
  describe('::validateValues', function() {
    it('should not throw', function() {
      TestModel.validateValues({})
    })
  })
  
  describe('::processValues', function() {
    it('should exist', function() {
      expect(TestModel.processValues).to.be.a('function')
    })
  })
  
  
  
  /* * * INSTANCE PROPERTIES * * */
  
  describe('#adapter', function() {
    it('should return the adapter when set', function() {
      let m = new TestModel()
      expect(m.adapter).to.equal(TestModel.adapter)
    })
  })
  
  describe('#schema', function() {
    it('should return the schema when set', function() {
      let m = new TestModel()
      expect(m.schema).to.equal(TestModel.schema)
    })
  })
  
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
  
  describe('#constructor', function() {
    it('should store the values', function() {
      let vals = {}
      let m = new TestModel(vals)
      expect(m.values).to.equal(vals)
    })
    it('should set the id to null', function() {
      let m = new TestModel()
      expect(m.id).to.be.null
    })
    it('should use values fallback', function() {
      let m = new TestModel()
      expect(m.values).to.exist
    })
    it('should install values via attributes', function() {
      let m = new TestModel({ name: 'Geoff' })
      expect(m.name).to.equal('Geoff')
    })
  })
  
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
      let m = new TestModel({ id: 1, name: 'Geoff' })
      try {
        await m.save()
        expect.fail('Should throw')
      }
      catch (error) {
        expect(error).matches(/Cannot update/)
      }
    })
  })
  
  describe('#destroy', function() {
    it('should remove the model', async function() {
      
      let m = await TestModel.create({ name: 'Geoff' })
      await m.destroy()
      
      let found = await TestModel.findOne(1)
      expect(found).to.be.null
    })
    it('should fail if the model isn\'t created yet', async function() {
      let m = new TestModel({ name: 'Geoff' })
      
      try {
        await m.destroy()
        expect.fail('Should throw')
      }
      catch (error) {
        expect(error).matches(/hasn't ben created/)
      }
    })
    it('should fail if model does not exist', async function() {
      
      let m = new TestModel({ id: 1, name: 'Geoff' })
      
      try {
        await m.destroy()
        expect.fail('Should throw')
      }
      catch (error) {
        expect(error).matches(/that doesn't exist/)
      }
    })
  })
  
  describe('#inspect', function() {
    it('should return its values', function() {
      let m = new TestModel({name: 'Geoff'})
      let object = m.inspect()
      expect(object.id).to.equal(m.values.id)
      expect(object.name).to.equal(m.values.name)
      expect(object.createdAt).to.equal(m.values.createdAt)
      expect(object.updatedAt).to.equal(m.values.updatedAt)
    })
  })
  
  describe('#toJSON', function() {
    it('should return its values', function() {
      let m = new TestModel({name: 'Geoff'})
      let object = m.toJSON()
      expect(object.id).to.equal(m.values.id)
      expect(object.name).to.equal(m.values.name)
      expect(object.createdAt).to.equal(m.values.createdAt)
      expect(object.updatedAt).to.equal(m.values.updatedAt)
    })
  })
  
})
