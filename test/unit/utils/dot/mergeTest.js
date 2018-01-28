const expect = require('chai').expect
const mergeUsingDot = require('../../../../lib/utils/dot/merge')

describe('#mergeUsingDot', function() {
  
  it('should create intermediate objects', async function() {
    let value = {}
    mergeUsingDot(value, 'a.b.c', { d: 4 })
    expect(value.a.b).to.exist
  })
  
  it('should merge the value in', async function() {
    let value = { a: { b: 5 } }
    mergeUsingDot(value, 'a', { c: 9 })
    expect(value.a).to.have.property('c', 9)
  })
  
  it('should fail for intermediate non-objects', async function() {
    let value = { a: 5 }
    let merging = () => mergeUsingDot(value, 'a.b', { c: 3 })
    expect(merging).to.throw()
  })
  
  it('should fail for fianl non-objects', async function() {
    let value = { a: { b: -1 } }
    let merging = () => mergeUsingDot(value, 'a.b', { c: 3 })
    expect(merging).to.throw()
  })
  
})
