const expect = require('chai').expect
const Otter = require('../../lib/Otter')
const { Query } = Otter.Types

const { makeModel } = require('../utils')

describe('Query', function() {
  
  let TestModel, Untyped, DatedModel
  
  beforeEach(async function() {
    TestModel = makeModel('TestModel', {
      name: String, other: 'Untyped'
    })
    DatedModel = makeModel('DatedModel', { id: Date })
    Untyped = class extends Otter.Types.Attribute { }
    await Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
      .addModel(TestModel)
      .addModel(DatedModel)
      .addAttribute(Untyped)
      .start()
  })
  
  
  describe('#constructor', function() {
    
    it('should set the modelName', function() {
      let q = new Query(TestModel, {})
      expect(q.modelName).to.equal('TestModel')
    })
    
    it('should set the model', async function() {
      let q = new Query(TestModel, {})
      expect(q.model).to.equal(TestModel)
    })
    
    it('should initialize properties', function() {
      let q = new Query(TestModel, {})
      expect(q.where).to.deep.equal({})
      expect(q.sort).to.equal(null)
      expect(q.limit).to.equal(null)
      expect(q.pluck).to.equal(null)
    })
    
    it('should have a default value for where', function() {
      let q = new Query(TestModel)
      expect(q.where).to.exist
    })
    
    it('should use id shorthand', function() {
      let q = new Query(TestModel, '7')
      expect(q.where.id).to.equal('7')
    })
    
    it('should use id shorthand with arbitrary model id type', function() {
      let dateAsAnId = new Date()
      let q = new Query(DatedModel, dateAsAnId)
      expect(q.where.id).to.equal(dateAsAnId)
    })
    
    it('should use id array shorthand', function() {
      let q = new Query(TestModel, ['1', '2'])
      expect(q.where.id).to.have.members(['1', '2'])
    })
    
    it('should use id array shorthand with arbitrary model id type', function() {
      let datesAsIds = [ new Date(), new Date() ]
      let q = new Query(DatedModel, datesAsIds)
      expect(q.where.id).to.deep.equal(datesAsIds)
    })
    
    it('should construct where using where shorthand', function() {
      let q = new Query(TestModel, { a: 100 })
      expect(q.where.a).to.equal(100)
    })
    
    it('should deconstruct options param', function() {
      let q = new Query(TestModel, 'a', {
        sort: 'b', limit: 'c', pluck: 'd'
      })
      
      expect(q.sort).to.equal('b')
      expect(q.limit).to.equal('c')
      expect(q.pluck).to.equal('d')
    })
    
    it('should fail array shorthand is not strings', function() {
      /* eslint-disable no-new */
      let creatingQuery = () => {
        new Query(TestModel, [ '1', 2 ])
      }
      expect(creatingQuery).to.throw(/must be strings/)
    })
  })
  
  
  describe('#prepareForSchema', function() {
    
    it('should pass if all attributes are valid', function() {
      let q = new Query(TestModel, { name: {'!': 'Geoff'} })
      q.prepareForSchema(TestModel.schema)
    })
    
    it('should processes the query', function() {
      let q = new Query(TestModel, { name: { '!': 'Geoff' } })
      q.prepareForSchema(TestModel.schema)
      expect(q.processed).to.exist
      expect(q.processed.name).to.exist
    })
    
    it('should fail for unknown expressions', function() {
      let query = new Query(TestModel, { name: { 'random': 'Geoff' } })
      let callingValidate = () => query.prepareForSchema(TestModel.schema)
      expect(callingValidate).throws(/Unrecognised query expression/)
    })
    
    it('should fail for untyped attributes', async function() {
      let query = new Query(TestModel, { other: 10 })
      let callingValidate = () => query.prepareForSchema(TestModel.schema)
      expect(callingValidate).throws(/Cannot query untyped/)
    })
  })
  
  
  describe('#validateExpr', function() {
    
    it('should store the type', function() {
      let expr = { '!': 'Geoff' }
      let q = new Query(TestModel, { name: expr })
      q.prepareForSchema(TestModel.schema)
      expect(q.processed.name.type).to.equal('inequality')
      expect(q.processed.name.expr).to.deep.equal(expr)
    })
  })
})
