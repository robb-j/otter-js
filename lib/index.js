const Otter = require('./Otter')

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


(async () => {
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
    
    Otter.use(Otter.Plugins.MemoryConnection)
    
    
    await Otter.start()
    
    console.log('Otter Started')
    
    let wilson = await Pet.create({ name: 'wilson' })
    
    await Person.create([
      { name: 'Geoff', age: 21, pet: wilson },
      { name: 'Terrance', age: 14 },
      { name: 'Bobby', age: 42 },
      { name: 'Billy', age: 19 },
      { name: 'Bojack', age: 19, isCool: true }
    ])
    
    await Person.update({ name: 'Bobby' }, { isCool: true })
    
    // await Person.updateAll()
    //   .where({ name: 'Bobby', isCool: false })
    //   .set({ 'isCool': true, name: 'BobbyG' })
    
    let models = await Person.find()
      .where('name', 'Geoff')
    //   .where('name', /o/g)
    //   .where('age', { '>': 0 })
    //   .limit(2)
    
    console.log('Found', models)
  }
  catch (error) {
    console.error('error', error.message)
  }
})()
