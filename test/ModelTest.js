const assert = require('assert')
const assExt = require('./assertExtension')
const Otter = require('../lib/Otter')


class BaseTestModel extends Otter.Types.Model {
  constructor(values) { super(values); this.callbacks = {} }
  
  static attributes() { return { name: String, pass: 'Secret' } }
}

class Secret extends Otter.Types.Attribute {
  get isProtected() { return true }
}

describe('Model', function() {
  
  let TestOtter, TestModel
  
  beforeEach(async function() {
    TestOtter = Otter.extend()
    TestModel = class extends BaseTestModel { }
    TestOtter.addModel(TestModel)
    TestOtter.addAttribute(Secret)
    TestOtter.use(Otter.Plugins.MemoryConnection)
    await TestOtter.start()
  })
  
  
  
  /* * * STATIC PROPERTIES * * */
  
  describe('::attributes', function() {
    it('should contain id property', function() {
      let props = TestModel.collectAttributes()
      assert(props.id)
    })
    it('should contain createdAt property', function() {
      let props = TestModel.collectAttributes()
      assert(props.createdAt)
    })
    it('should contain updatedAt property', function() {
      let props = TestModel.collectAttributes()
      assert(props.updatedAt)
    })
  })
  
  describe('::collectAttributes', function() {
    it('should contain base properties', function() {
      let base = TestModel.attributes()
      let collected = TestModel.collectAttributes()
      assert(collected, base)
    })
  })
  
  describe('::adapterName', function() {
    it('should have a default value of "default"', function() {
      assert.equal(TestModel.adapterName(), 'default')
    })
  })
  
  describe('::adapter', function() {
    it('should return the adapter when set', function() {
      let adapter = {}
      TestModel._adapter = adapter
      assert.equal(TestModel.adapter, adapter)
    })
  })
  
  describe('::schema', function() {
    it('should return the schema when set', function() {
      let schema = {}
      TestModel._schema = schema
      assert.equal(TestModel.schema, schema)
    })
  })
  
  describe('::isActive', function() {
    it('should be false by default', function() {
      class NewModel extends Otter.Types.Model {}
      assert(NewModel.isActive === false)
    })
    it('should be true when an adapter & schema is set', function() {
      assert(TestModel.isActive)
    })
  })
  
  
  
  /* * * STATIC QUERYING * * */
  
  describe('::create', function() {
    it('should create a new record', async function() {
      let geoff = await TestModel.create({ name: 'Geoff' })
      assert(geoff)
      assert.equal(geoff.name, 'Geoff')
    })
    it('should create multiple records', async function() {
      let models = await TestModel.create([
        { name: 'Tom' },
        { name: 'Bob' }
      ])
      assert(Array.isArray(models))
      assert.equal(models.length, 2)
    })
  })
  
  describe('::find', function() {
    it('should return matching models', async function() {
      await TestModel.create([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
      
      let matches = await TestModel.find({name: 'Terrance'})
      assert.equal(matches.length, 1)
      assert.equal(matches[0].name, 'Terrance')
    })
  })
  
  describe('::findOne', function() {
    it('should return the first match', async function() {
      await TestModel.create([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
      
      let geoff = await TestModel.findOne()
      assert(geoff)
      assert.equal(geoff.name, 'Geoff')
    })
  })
  
  describe('::destroy', function() {
    it('should remove matching models', async function() {
      await TestModel.create([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
      
      let count = await TestModel.destroy()
      assert.equal(count, 2)
    })
    it('should ', function() {})
  })
  
  describe('::update', function() {
    beforeEach(async function() {
      await TestModel.create([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
    })
    
    it('should update all records', async function() {
      await TestModel.update({}, { name: 'Bob' })
      let models = await TestModel.find()
      assert.equal(models[0].name, 'Bob')
      assert.equal(models[1].name, 'Bob')
    })
    it('should update matching records', async function() {
      await TestModel.update(2, { name: 'Bob' })
      let models = await TestModel.find()
      assert.equal(models[0].name, 'Geoff')
      assert.equal(models[1].name, 'Bob')
    })
  })
  
  
  
  /* * * STATIC HOOKS * * */
  
  describe('::validateValues', function() {
    it('should exist', function() {
      assert.equal(typeof TestModel.validateValues, 'function')
    })
    it('should not throw', function() {
      assert.doesNotThrow(() => {
        TestModel.validateValues({})
      })
    })
  })
  
  describe('::processValues', function() {
    it('should exist', function() {
      assert.equal(typeof TestModel.processValues, 'function')
    })
  })
  
  
  
  /* * * INSTANCE PROPERTIES * * */
  
  describe('#adapter', function() {
    it('should return the adapter when set', function() {
      let m = new TestModel()
      assert.equal(m.adapter, TestModel.adapter)
    })
  })
  
  describe('#schema', function() {
    it('should return the schema when set', function() {
      let m = new TestModel()
      assert.equal(m.schema, TestModel.schema)
    })
  })
  
  describe('#modelName', function() {
    it('should return the name of the model', function() {
      let m = new TestModel()
      assert.equal(m.modelName, 'TestModel')
    })
  })
  
  describe('#exists', function() {
    it('should be true when model is created', async function() {
      let m = await TestModel.create({ name: 'Geoff' })
      assert.equal(m.exists, true)
    })
    it('should be false when model is not created', function() {
      let m = new TestModel({ name: 'Geoff' })
      assert.equal(m.exists, false)
    })
  })
  
  
  
  /* * * INSTANCE METHODS * * */
  
  describe('#constructor', function() {
    it('should store the values', function() {
      let vals = {}
      let m = new TestModel(vals)
      assert.equal(m.values, vals)
    })
    it('should set the id to null', function() {
      let m = new TestModel()
      assert(m.id === null)
    })
    it('should use values fallback', function() {
      let m = new TestModel()
      assert(m.values)
    })
    it('should install values via attributes', function() {
      let m = new TestModel({ name: 'Geoff' })
      assert.equal(m.name, 'Geoff')
    })
  })
  
  describe('#save', function() {
    it('should add a model to the store', async function() {
      let m = new TestModel({ name: 'Geoff' })
      await m.save()
      assert.equal(m.adapter.store.TestModel[1].name, 'Geoff')
    })
    it('should set the id on new models', async function() {
      let m = new TestModel({ name: 'Geoff' })
      await m.save()
      assert.equal(m.id, 1)
    })
    it('should update existing models', async function() {
      
      let m = await TestModel.create({ name: 'Geoff' })
      m.name = 'Terrance'
      
      await m.save()
      
      assert.equal(m.adapter.store.TestModel[1].name, 'Terrance')
    })
    it('should fail updating a model that does not exist', async function() {
      let m = new TestModel({ id: 1, name: 'Geoff' })
      let error = await assExt.getAsyncError(() => { return m.save() })
      assert(error)
      assExt.assertRegex(/Cannot update/, error.message)
    })
  })
  
  describe('#destroy', function() {
    it('should remove the model', async function() {
      
      let m = await TestModel.create({ name: 'Geoff' })
      await m.destroy()
      
      let found = await TestModel.findOne(1)
      assert.equal(found, null)
    })
    it('should fail if the model isn\'t created yet', async function() {
      
      let m = new TestModel({ name: 'Geoff' })
      
      let error = await assExt.getAsyncError(() => {
        return m.destroy()
      })
      
      assert(error)
      assExt.assertRegex(/hasn't ben created/, error.message)
    })
    it('should fail if model does not exist', async function() {
      
      let m = new TestModel({ id: 1, name: 'Geoff' })
      
      let error = await assExt.getAsyncError(() => {
        return m.destroy()
      })
      
      assert(error)
      assExt.assertRegex(/that doesn't exist/, error.message)
    })
  })
  
  describe('#inspect', function() {
    it('should return its values', function() {
      let m = new TestModel({name: 'Geoff'})
      let object = m.inspect()
      assert.equal(object.id, m.values.id)
      assert.equal(object.name, m.values.name)
      assert.equal(object.createdAt, m.values.createdAt)
      assert.equal(object.updatedAt, m.values.updatedAt)
    })
  })
  
  describe('#toJSON', function() {
    it('should return its values', function() {
      let m = new TestModel({name: 'Geoff'})
      let object = m.toJSON()
      assert.equal(object.id, m.values.id)
      assert.equal(object.name, m.values.name)
      assert.equal(object.createdAt, m.values.createdAt)
      assert.equal(object.updatedAt, m.values.updatedAt)
    })
  })
  
})
