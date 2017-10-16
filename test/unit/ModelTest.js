const expect = require('chai').expect
const Otter = require('../../lib/Otter')


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
      expect(props.id).to.exist
    })
    it('should contain createdAt property', function() {
      let props = TestModel.collectAttributes()
      expect(props.createdAt).to.exist
    })
    it('should contain updatedAt property', function() {
      let props = TestModel.collectAttributes()
      expect(props.updatedAt).to.exist
    })
  })
  
  describe('::collectAttributes', function() {
    it('should contain base properties', function() {
      let base = TestModel.attributes()
      let collected = TestModel.collectAttributes()
      expect(collected).to.include(base)
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
    it('should return matching models', async function() {
      await TestModel.create([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
      
      let matches = await TestModel.find({name: 'Terrance'})
      expect(matches).to.have.lengthOf(1)
      expect(matches[0].name).to.equal('Terrance')
    })
  })
  
  describe('::findOne', function() {
    it('should return the first match', async function() {
      await TestModel.create([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
      
      let geoff = await TestModel.findOne()
      expect(geoff).to.have.property('name').that.equals('Geoff')
    })
  })
  
  describe('::destroy', function() {
    it('should remove matching models', async function() {
      await TestModel.create([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
      
      let count = await TestModel.destroy()
      expect(count).to.equal(2)
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
      await TestModel.update({}, { name: 'Bob' })
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