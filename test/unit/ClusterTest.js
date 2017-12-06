const expect = require('chai').expect
const Otter = require('../../lib/Otter')
const MemoryAdapter = require('../../lib/adapters/MemoryAdapter')

const { makeCluster } = require('../utils')

describe('Cluster', function() {
  
  let TestCluster, SubCluster, adapter
  beforeEach(async function() {
    adapter = new MemoryAdapter()
    TestCluster = makeCluster('TestCluster', {
      name: String, age: Number
    })
    SubCluster = class extends TestCluster {
      static attributes() { return { isCool: Boolean } }
    }
    await Otter.extend()
      .addAdapter(adapter)
      .addCluster(TestCluster)
      .addCluster(SubCluster)
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
      let attrs = TestCluster.collectAttributes(adapter)
      expect(attrs).to.have.property('name')
    })
    it('should merge properties with superclass', function() {
      let attrs = SubCluster.collectAttributes(adapter)
      expect(attrs).to.have.property('name')
      expect(attrs).to.have.property('isCool')
    })
  })
  
  describe('::adapterName', function() {
    it('should have a default value of "default"', function() {
      expect(TestCluster.adapterName()).to.equal('default')
    })
  })
  
  describe('::adapter', function() {
    it('should return the adapter when set', function() {
      let adapter = {}
      TestCluster._adapter = adapter
      expect(TestCluster.adapter).to.equal(adapter)
    })
  })
  
  describe('::schema', function() {
    it('should return the schema when set', function() {
      let schema = {}
      TestCluster._schema = schema
      expect(TestCluster.schema).to.equal(schema)
    })
  })
  
  describe('::isActive', function() {
    it('should be false by default', function() {
      class NewCluster extends Otter.Types.Cluster {}
      expect(NewCluster.isActive).to.equal(false)
    })
    it('should be true when an adapter & schema is set', function() {
      expect(TestCluster.isActive).to.equal(true)
    })
  })
  
  
  
  
  /* * * STATIC HOOKS * * */
  
  describe('::validateValues', function() {
    it('should not throw', function() {
      TestCluster.validateValues({})
    })
  })
  
  describe('::processValues', function() {
    it('should exist', function() {
      expect(TestCluster.processValues).to.be.a('function')
    })
  })
  
  
  
  
  /* * * INSTANCE PROPERTIES * * */
  
  describe('#adapter', function() {
    it('should return the adapter when set', function() {
      let m = new TestCluster()
      expect(m.adapter).to.equal(TestCluster.adapter)
    })
  })
  
  describe('#schema', function() {
    it('should return the schema when set', function() {
      let m = new TestCluster()
      expect(m.schema).to.equal(TestCluster.schema)
    })
  })
  
  
  
  
  /* * * INSTANCE METHODS * * */
  
  describe('#constructor', function() {
    it('should store the values', function() {
      let vals = {}
      let m = new TestCluster(vals)
      expect(m.values).to.equal(vals)
    })
    it('should use values fallback', function() {
      let m = new TestCluster()
      expect(m.values).to.exist
    })
    it('should install values via attributes', function() {
      let m = new TestCluster({ name: 'Geoff' })
      expect(m.name).to.equal('Geoff')
    })
  })
  
  describe('#validate', function() {
    
    it('should return any errors thrown', async function() {
      let obj = new TestCluster({ name: 7, age: 'Bob' })
      let error = obj.validate()
      expect(error).to.exist
    })
  })
  
  describe('#inspect', function() {
    it('should return its values', function() {
      let m = new TestCluster({name: 'Geoff', age: 7})
      let object = m.inspect()
      expect(object.name).to.equal(m.values.name)
      expect(object.age).to.equal(m.values.age)
    })
  })
  
  describe('#toJSON', function() {
    it('should return its values', function() {
      let m = new TestCluster({name: 'Geoff', age: 7})
      let object = m.toJSON()
      expect(object.name).to.equal(m.values.name)
      expect(object.age).to.equal(m.values.age)
    })
  })
})
