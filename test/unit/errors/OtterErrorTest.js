const expect = require('chai').expect
const OtterError = require('../../../lib/errors/OtterError')

describe('OtterError', function() {
  
  describe('#constructor', function() {
    it('should set the error name', async function() {
      let error = new OtterError('...')
      expect(error.name).to.equal('OtterError')
    })
  })
  
  describe('::fromCode', function() {
    
    it('should create an error', async function() {
      let error = OtterError.fromCode('adapter.invalidProcessor')
      expect(error).to.exist
    })
    
    it('should render the template', async function() {
      let error = OtterError.fromCode('adapter.invalidProcessor')
      expect(error.message).to.equal('Invalid Processor: Should be a function')
    })
    
    it('should pass args to template when rendering', async function() {
      let error = OtterError.fromCode('adapter.unknownModel', 'SomeModel')
      expect(error.message).to.equal(`Cannot query unknown Model: 'SomeModel'`)
    })
    
    it('should store the code', async function() {
      let error = OtterError.fromCode('adapter.unknownModel', 'SomeModel')
      expect(error.code).to.equal(`adapter.unknownModel`)
    })
  })
  
  describe('::registerTypes', function() {
    it('should store the register the templates', async function() {
      OtterError.registerTypes('test', {
        fancy: () => 'Fancy Message'
      })
      let error = OtterError.fromCode('test.fancy')
      expect(error.message).to.equal('Fancy Message')
    })
  })
  
})
