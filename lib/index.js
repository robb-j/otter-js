const Otter = require('./Otter')
const { AddTraits } = Otter.Utils

class Person extends Otter.Types.Model {
  static attributes() {
    return {
      name: { type: String },
      age: { type: Number },
      isCool: { type: Boolean, default: false },
      pet: { hasOne: 'Pet' }
    }
  }
}

class Pet extends Otter.Types.Model {
  static attributes() {
    return { name: String }
  }
}



const TraitA = (Type) => class extends Type {
  static first() { console.log('::first') }
  first() { console.log('#first') }
  
  constructor(...args) {
    super(...args)
    this.a = 'A'
  }
}

const TraitB = (Type) => class extends Type {
  static second() { console.log('::second') }
  second() { console.log('#second') }
  
  constructor(...args) {
    super(...args)
    this.b = 'B'
  }
}

class C {
  static third() { console.log('::third') }
  third() { console.log('#third') }
  
  constructor(...args) {
    this.c = 'C'
    console.log('args', args)
  }
}

class D extends AddTraits(C, TraitB, TraitA) {
  
}

console.log(D)
D.first()
D.second()
D.third()

let d = new D('z', 'x', 'y')

console.log(d)
d.first()
d.second()
d.third()


;(async () => {
  try {
    
    Otter.addModel(Person)
    Otter.addModel(Pet)
    
    // let myPlugin = {
    //   install(Otter) {
    //
    //     // Register a custom attribute
    //     // Otter.addAttribute(MyFancyAttribute)
    //     // ...
    //
    //     // Register a model
    //     Otter.addModel(Person)
    //     // ...
    //   }
    // }
    //
    // Otter.use(myPlugin)
    
    
    // Otter.use(Otter.Plugins.MongoConnection, {
    //   url: 'mongodb://root:secret@127.0.0.1:27017/otter?authSource=admin'
    // });
    
    // Otter.use(Otter.Plugins.MongoConnection, {
    //   fromEnv: [ 'HOST', 'NAME', 'USER', 'PASS' ]
    // })
    
    // Otter.use(Otter.Plugins.MemoryConnection)
    //
    //
    // await Otter.start()
    //
    // console.log('Otter Started')
    //
    // let wilson = await Pet.create({ name: 'wilson' })
    //
    // await Person.create([
    //   { name: 'Geoff', age: 21, pet: wilson },
    //   { name: 'Terrance', age: 14 },
    //   { name: 'Bobby', age: 42 },
    //   { name: 'Billy', age: 19 },
    //   { name: 'Bojack', age: 19, isCool: true }
    // ])
    
    // await Person.update({ name: 'Bobby' }, { isCool: true })
    
    // await Person.updateAll()
    //   .where({ name: 'Bobby', isCool: false })
    //   .set({ 'isCool': true, name: 'BobbyG' })
    
    // let models = await Person.find()
    //   .where('name', 'Geoff')
    //   .where('name', /o/g)
    //   .where('age', { '>': 0 })
    //   .limit(2)
    
    // console.log('Found', models)
    
    
    // let rodger = await Person.create({ name: 'Rodger' })
    //
    // console.log(await rodger.pet)
    //
    // rodger.pet = wilson
    //
    // console.log(await rodger.pet_id)
    // console.log(await rodger.pet)
    //
    // await rodger.save()
    //
    // let models = await Person.findOne({ name: 'Rodger' })
    //
    // console.log(models)
    
  }
  catch (error) {
    console.error('error', error.message)
  }
})()
