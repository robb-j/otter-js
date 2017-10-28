const Otter = require('./Otter')

class MyModel extends Otter.Types.Model {
  static attributes() {
    return {
      name: { type: String },
      age: { type: Number },
      isCool: { type: Boolean, default: false }
    }
  }
}



(async () => {
  try {
    
    Otter.addModel(MyModel)
    
    // let myPlugin = {
    //   install(Otter) {
    //
    //     // Register a custom attribute
    //     // Otter.addAttribute(MyFancyAttribute)
    //     // ...
    //
    //     // Register a model
    //     Otter.addModel(MyModel)
    //     // ...
    //   }
    // }
    //
    // Otter.use(myPlugin)
    
    
    // Otter.use(Otter.Plugins.MongoConnection, {
    //   url: 'mongodb://root:secret@127.0.0.1:27017/otter?authSource=admin'
    // });
    
    Otter.use(Otter.Plugins.MemoryConnection)
    
    
    await Otter.start()
    
    console.log('Otter Started')
    
    await MyModel.create([
      { name: 'Geoff', age: 21 },
      { name: 'Terrance', age: 14 },
      { name: 'Bobby', age: 42 },
      { name: 'Billy', age: 19 },
      { name: 'Bojack', age: 19, isCool: true }
    ])
    
    await MyModel.update({ name: 'Bobby' }, { isCool: true })
    
    // await MyModel.updateAll()
    //   .where({ name: 'Bobby', isCool: false })
    //   .set({ 'isCool': true, name: 'BobbyG' })
    
    let models = await MyModel.find()
      .where('name', /o/g)
      .where('age', { '>': 0 })
      .limit(2)
    
    console.log('Found', models)
  }
  catch (error) {
    console.error('error', error.message)
  }
})()
