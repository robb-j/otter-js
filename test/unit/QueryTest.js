const expect = require('chai').expect
const Otter = require('../../lib')
const { Query } = Otter.Types

const { asyncError, makeModel } = require('../utils')
const { AddTraits, AssociativeType } = Otter.Utils

describe('Query', function() {
  
  let TestModel, Untyped, DatedModel, Associated
  
  beforeEach(async function() {
    TestModel = makeModel('TestModel', {
      // name: String, other: 'Untyped'
      name: String, other: 'Untyped', nest: 'Associated'
    })
    DatedModel = makeModel('DatedModel', { id: Date })
    Untyped = class extends Otter.Types.Attribute { }
    Associated = class extends AddTraits(Otter.Types.Attribute, AssociativeType) {
      associatedCluster() { return TestModel }
    }
    await Otter.extend()
      .use(Otter.Plugins.MemoryConnection)
      .addModel(TestModel)
      .addModel(DatedModel)
      .addAttribute(Untyped)
      .addAttribute(Associated)
      .start()
  })
  
  
  describe('#constructor', function() {
    
    it('should set the modelName', async function() {
      let q = new Query(TestModel, {})
      expect(q.modelName).to.equal('TestModel')
    })
    
    it('should set the model', async function() {
      let q = new Query(TestModel, {})
      expect(q.model).to.equal(TestModel)
    })
    
    it('should initialize properties', async function() {
      let q = new Query(TestModel, {})
      expect(q.where).to.deep.equal({})
      expect(q.sort).to.equal(null)
      expect(q.limit).to.equal(null)
      expect(q.pluck).to.equal(null)
    })
    
    it('should have a default value for where', async function() {
      let q = new Query(TestModel)
      expect(q.where).to.exist
    })
    
    it('should use id shorthand', async function() {
      let q = new Query(TestModel, '7')
      expect(q.where.id).to.equal('7')
    })
    
    it('should use id shorthand with arbitrary model id type', async function() {
      let dateAsAnId = new Date()
      let q = new Query(DatedModel, dateAsAnId)
      expect(q.where.id).to.equal(dateAsAnId)
    })
    
    it('should use id array shorthand', async function() {
      let q = new Query(TestModel, ['1', '2'])
      expect(q.where.id).to.have.members(['1', '2'])
    })
    
    it('should use id array shorthand with arbitrary model id type', async function() {
      let datesAsIds = [ new Date(), new Date() ]
      let q = new Query(DatedModel, datesAsIds)
      expect(q.where.id).to.deep.equal(datesAsIds)
    })
    
    it('should construct where using where shorthand', async function() {
      let q = new Query(TestModel, { a: 100 })
      expect(q.where.a).to.equal(100)
    })
    
    it('should deconstruct options param', async function() {
      let q = new Query(TestModel, 'a', {
        sort: 'b', limit: 'c', pluck: 'd'
      })
      
      expect(q.sort).to.equal('b')
      expect(q.limit).to.equal('c')
      expect(q.pluck).to.equal('d')
    })
    
    it('should fail array shorthand is not ids', async function() {
      let error = await asyncError(() => new Query(TestModel, [ '1', 2 ]))
      expect(error.code).to.equal('query.invalidShorthand')
    })
  })
  
  
  describe('#prepareForSchema', function() {
    
    it('should pass if all attributes are valid', async function() {
      let q = new Query(TestModel, { name: {'!': 'Geoff'} })
      q.prepareForSchema(TestModel.schema)
    })
    
    it('should processes the query', async function() {
      let q = new Query(TestModel, { name: { '!': 'Geoff' } })
      q.prepareForSchema(TestModel.schema)
      expect(q.processed).to.exist
      expect(q.processed.name).to.exist
    })
    
    it('should fail for unknown attributes', async function() {
      let query = new Query(TestModel, { unknown: 73 })
      let error = await asyncError(() => query.prepareForSchema(TestModel.schema))
      expect(error.code).to.equal('query.unknownAttr')
    })
    
    it('should fail for unknown expressions', async function() {
      let query = new Query(TestModel, { name: { 'random': 'Geoff' } })
      let error = await asyncError(() => query.prepareForSchema(TestModel.schema))
      expect(error.code).to.equal('query.unknownExpr')
    })
    
    it('should fail for untyped attributes', async function() {
      let query = new Query(TestModel, { other: 10 })
      let error = await asyncError(() => query.prepareForSchema(TestModel.schema))
      expect(error.code).to.equal('query.untypedAttr')
    })
    
    it('should process dot notation', async function() {
      let query = new Query(TestModel, { 'nest.name': 'Geoff' })
      query.prepareForSchema(TestModel.schema)
      expect(query.processed).to.have.property('nest.name')
    })
  })
  
  
  describe('#validateExpr', function() {
    
    it('should store the type', async function() {
      let expr = { '!': 'Geoff' }
      let q = new Query(TestModel, { name: expr })
      q.prepareForSchema(TestModel.schema)
      expect(q.processed.name.type).to.equal('inequality')
      expect(q.processed.name.expr).to.deep.equal(expr)
    })
  })
})
