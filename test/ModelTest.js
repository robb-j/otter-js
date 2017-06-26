const assert = require('assert')
const Otter = require('../lib/Otter')

describe('Model', function() {
  
  
  describe('#attributes', function() {
    
    it('should contain id property', function() {
      let props = Otter.Types.Model.collectAttributes()
      assert(props.id)
    })
    
    it('should contain createdAt property', function() {
      let props = Otter.Types.Model.collectAttributes()
      assert(props.createdAt)
    })
    
    it('should contain updatedAt property', function() {
      let props = Otter.Types.Model.collectAttributes()
      assert(props.updatedAt)
    })
    
  })
  
  
  describe('#collectAttributes', function() {
    
    it('should contain base properties', function() {
      
      let base = Otter.Types.Model.attributes()
      let collected = Otter.Types.Model.collectAttributes()
      assert(collected, base)
    })
    
  })
  
  
})
