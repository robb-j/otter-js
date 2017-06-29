const assert = require('assert')
const assExt = require('./assertExtension')
const Otter = require('../lib/Otter')

describe('Model', function() {
  
  let TestOtter, TestModel
  
  beforeEach(async function() {
    TestOtter = Otter.extend()
    TestModel = class extends Otter.Types.Model {
      static attributes() { return { name: String } }
    }
    TestOtter.addModel(TestModel)
    TestOtter.use(Otter.Plugins.MemoryConnection)
    await TestOtter.start()
  })
  
  
  
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
  
  
  describe('::create', function() {
    it('should do something', async function() {
      let geoff = await TestModel.create({ name: 'Geoff' })
      assert(geoff)
      assert.equal(geoff.name, 'Geoff')
    })
  })
  
  describe('::createMany', function() {
    it('should create multiple models', async function() {
      let people = await TestModel.createMany([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
      
      assert.equal(people.length, 2)
      assExt.assertClass(people[0], 'TestModel')
      assert.equal(people[0].name, 'Geoff')
      assert.equal(people[1].name, 'Terrance')
    })
  })
  
  
  describe('::find', function() {
    it('should return matching models', async function() {
      await TestModel.createMany([
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
      await TestModel.createMany([
        { name: 'Geoff' },
        { name: 'Terrance' }
      ])
      
      let geoff = await TestModel.findOne()
      assert(geoff)
      assert.equal(geoff.name, 'Geoff')
    })
  })
  
  
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
      let m = new TestModel({name: 'Geoff'})
      assert.equal(m.name, 'Geoff')
    })
  })
  
  
})
