const expect = require('chai').expect
const Otter = require('../../lib/Otter')
const { Query } = Otter.Types

describe('Query', function() {
  
  let TestModel, Untyped
  
  beforeEach(async function() {
    TestModel = class extends Otter.Types.Model {
      static attributes() { return { name: String, other: 'Untyped' } }
    }
    Untyped = class extends Otter.Types.Attribute { }
    await Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
      .addModel(TestModel)
      .addAttribute(Untyped)
      .start()
  })
  
  
  describe('#constructor', function() {
    
    it('should set the modelName', function() {
      let q = new Query('Model', {})
      expect(q.modelName).to.equal('Model')
    })
    
    it('should initialize properties', function() {
      let q = new Query('Model', {})
      expect(q.where).to.deep.equal({})
      expect(q.sort).to.equal(null)
      expect(q.limit).to.equal(null)
      expect(q.pluck).to.equal(null)
    })
    
    it('should have a default value for where', function() {
      let q = new Query('Model')
      expect(q.where).to.exist
    })
    
    it('should construct where using string id shorthand', function() {
      let q = new Query('Model', '7')
      expect(q.where.id).to.equal('7')
    })
    
    it('should construct where using number id shorthand', function() {
      let q = new Query('Model', 7)
      expect(q.where.id).to.equal(7)
    })
    
    it('should construct where using array of ids', function() {
      let q = new Query('Model', ['1', '2'])
      expect(q.where.id).to.have.members(['1', '2'])
    })
    
    it('should construct where using where shorthand', function() {
      let q = new Query('Model', { a: 100 })
      expect(q.where.a).to.equal(100)
    })
    
    it('should deconstruct options param', function() {
      let q = new Query('Model', 'a', {
        sort: 'b', limit: 'c', pluck: 'd'
      })
      
      expect(q.sort).to.equal('b')
      expect(q.limit).to.equal('c')
      expect(q.pluck).to.equal('d')
    })
    
    it('should fail array shorthand is not strings', function() {
      /* eslint-disable no-new */
      let creatingQuery = () => {
        new Query('ModelName', [ '1', 2 ])
      }
      expect(creatingQuery).to.throw(/must be strings/)
    })
  })
  
  
  describe('#validateOn', function() {
    
    it('should pass if all attributes are valid', function() {
      let q = new Query('TestModel', { name: {'!': 'Geoff'} })
      q.validateOn(TestModel.schema)
    })
    
    it('should processes the query', function() {
      let q = new Query('TestModel', { name: { '!': 'Geoff' } })
      q.validateOn(TestModel.schema)
      expect(q.processed).to.exist
      expect(q.processed.name).to.exist
    })
    
    it('should fail for unknown expressions', function() {
      let query = new Query('TestModel', { name: { 'random': 'Geoff' } })
      let callingValidate = () => { query.validateOn(TestModel.schema) }
      expect(callingValidate).throws(/Unrecognised query expression/)
    })
    
    it('should fail for untyped attributes', async function() {
      let query = new Query('TestModel', { other: 10 })
      let callingValidate = () => { query.validateOn(TestModel.schema) }
      expect(callingValidate).throws(/Cannot query untyped/)
    })
  })
  
  
  describe('#validateExpr', function() {
    
    it('should store the type', function() {
      let expr = { '!': 'Geoff' }
      let q = new Query('TestModel', { name: expr })
      q.validateOn(TestModel.schema)
      expect(q.processed.name.type).to.equal('inequality')
      expect(q.processed.name.expr).to.deep.equal(expr)
    })
  })
})
