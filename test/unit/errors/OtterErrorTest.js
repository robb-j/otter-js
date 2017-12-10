const expect = require('chai').expect
const OtterError = require('../../../lib/errors/OtterError')

describe('OtterError', function() {
  
  beforeEach(async function() {
    OtterError.registerTypes('test', {
      basic: () => `A simple error`,
      param: (param) => `A better error, ${param}`
    })
  })
  
  describe('#constructor', function() {
    it('should set the error name', async function() {
      let error = new OtterError('...')
      expect(error.name).to.equal('OtterError')
    })
  })
  
  describe('::fromCode', function() {
    
    it('should create an error', async function() {
      let error = OtterError.fromCode('test.basic')
      expect(error).to.exist
    })
    
    it('should render the template', async function() {
      let error = OtterError.fromCode('test.basic')
      expect(error.message).to.equal('A simple error')
    })
    
    it('should pass args to template when rendering', async function() {
      let error = OtterError.fromCode('test.param', 'TheParam')
      expect(error.message).to.equal(`A better error, TheParam`)
    })
    
    it('should store the code', async function() {
      let error = OtterError.fromCode('test.basic')
      expect(error.code).to.equal(`test.basic`)
    })
    
    it('should fail for invalid codes', async function() {
      let creatingAnError = () => OtterError.fromCode('test.unknownCode')
      expect(creatingAnError).throws(/Invalid error code/)
    })
    
    it('should fail when passed the wrong amount of arguements', async function() {
      let creatingAnError = () => OtterError.fromCode('test.param')
      expect(creatingAnError).throws(/Invalid args/)
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
  
  describe('::composite', function() {
    
    let e1, e2
    beforeEach(async function() {
      e1 = OtterError.fromCode('test.basic')
      e2 = OtterError.fromCode('test.param', 'param')
    })
    
    it('should make a new error', async function() {
      let error = OtterError.composite(e1, e2)
      expect(error).to.exist
    })
    it('should generate a message', async function() {
      let error = OtterError.composite(e1, e2)
      expect(error).to.match(/simple error/)
      expect(error).to.match(/better error/)
    })
    it('should store the errors', async function() {
      let error = OtterError.composite(e1, e2)
      expect(error.subErrors).to.deep.equal([e1, e2])
    })
    it('should store the codes', async function() {
      let error = OtterError.composite(e1, e2)
      expect(error.subCodes).to.deep.equal(['test.basic', 'test.param'])
    })
  })
  
})
