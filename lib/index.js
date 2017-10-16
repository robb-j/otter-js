console.log()
const Otter = require('./Otter')



class MyModel extends Otter.Types.Model {
  static attributes() { return { name: String, age: Number } }
}


let myPlugin = {
  install(Otter) {
    
    // Register a custom attribute
    // Otter.addAttribute(MyFancyAttribute)
    // ...
    
    // Register a model
    Otter.addModel(MyModel)
    // ...
  }
}


Otter.use(myPlugin)


// Otter.use(Otter.Plugins.MongoConnection, {
//   url: 'mongodb://root:secret@127.0.0.1:27017/otter?authSource=admin'
// });

Otter.use(Otter.Plugins.MemoryConnection);



(async () => {
  
  try {
    
    await Otter.start()
    
    console.log('Otter Started')
    
    await MyModel.create([
      { name: 'Geoff', age: 21 },
      { name: 'Terrance', age: 14 },
      { name: 'Bobby', age: 42 },
      { name: 'Billy', age: 19 },
      { name: 'Bojack', age: 19 }
    ])
    
    let models = await MyModel.find2()
      .where('name', /o/g)
      .where('age', { '>': 0 })
      .limit(2)
    
    
    console.log('Found', models.length)
    
    // console.log(m)
    // console.log(JSON.stringify(m))
    
  }
  catch (error) {
    console.error('error', error.message)
  }
})()



// MyModel.findOne({ })
// MyModel.find({ })
// MyModel.update({ })
// MyModel.delete({ })
