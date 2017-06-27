const assert = require('assert')
const Otter = require('../lib/Otter')

describe('Model', function() {
  
  let TestModel
  
  beforeEach(function() {
    TestModel = class extends Otter.Types.Model { }
  })
  
  
  
  describe('#attributes', function() {
    
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
  
  
  describe('#collectAttributes', function() {
    
    it('should contain base properties', function() {
      let base = TestModel.attributes()
      let collected = TestModel.collectAttributes()
      assert(collected, base)
    })
    
  })
  
  
  describe('#adapterName', function() {
    
    it('should have a default value of "default"', function() {
      assert.equal(TestModel.adapterName(), 'default')
    })
  })
  
  
  describe('#adapter', function() {
    
    it('should return the adapter when set', function() {
      
      let adapter = {}
      TestModel._adapter = adapter
      
      assert.equal(TestModel.adapter, adapter)
    })
  })
  
  
  describe('#schema', function() {
    
    it('should return the schema when set', function() {
      
      let schema = {}
      TestModel._schema = schema
      
      assert.equal(TestModel.schema, schema)
    })
  })
  
  describe('#isActive', function() {
    
    it('should be false by default', function() {
      assert(TestModel.isActive === false)
    })
    
    it('should be true when an adapter & schema is set', function() {
      TestModel._adapter = {}
      TestModel._schema = {}
      assert(TestModel.isActive)
    })
  })
  
  
})
