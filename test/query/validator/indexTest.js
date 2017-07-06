
const QV = require('../../../lib/Otter').Types.QueryValidator
const assert = require('assert')
const assExt = require('../../assertExtension')

describe.only('QueryValidator', function() {
  
  it('should ...', function() {
    
    // console.log(QV.process('Geoff', 'string'))
    
    // console.log('regex', QV.process(/Geoff/, 'string'))
    
    // console.log('comp', QV.process({ '<': 5 }, 'number'))
    
    // console.log('logic', QV.process({
    //   and: [ { '<=': 300 }, { '>': 100 } ]
    // }, 'number'))
    
    console.log('inList', QV.process(['a', 'b', 'c'], 'string'))
  })
  
  
})
