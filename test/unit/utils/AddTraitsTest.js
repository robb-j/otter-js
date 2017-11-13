const expect = require('chai').expect
const AddTraits = require('../../../lib/utils/AddTraits')

const TraitA = (Type) => class extends Type {
  static staticA() { }
  instanceA() { }
}

const TraitB = (Type) => class extends Type {
  static staticB() { }
}

describe('#AddTraits', function() {
  
  let Base
  beforeEach(async function() {
    Base = class { }
  })
  
  it('should return a new class', async function() {
    let SubClass = AddTraits(Base, TraitA)
    expect(SubClass).does.not.equal(Base)
  })
  
  it('should add static methods from the trait', async function() {
    let SubClass = AddTraits(Base, TraitA)
    expect(SubClass).to.have.property('staticA')
  })
  
  it('should add instance methods from the trait', async function() {
    let SubClass = AddTraits(Base, TraitA)
    let object = new SubClass()
    expect(object).to.have.property('instanceA')
  })
  
  it('should add multiple traits', async function() {
    let SubClass = AddTraits(Base, TraitA, TraitB)
    expect(SubClass).to.have.property('staticA')
    expect(SubClass).to.have.property('staticB')
  })
  
})
