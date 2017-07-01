console.log('\n\nConfiguring')

const Otter = require('./Otter')



class MyModel extends Otter.Types.Model {
  static attributes() { return { name: String } }
}


let myPlugin = {
  install(Otter) {
    
    // Register a custom attribute
    // Otter.addAttribute(MyFancyAttribute)
    // ...
    
    // Register a model
    Otter.addModel(MyModel)
    // ...
   
    // Express style 'middleware' for query processing?
    // Otter.queryBuilders.myBuilder = async (input, query) => { }
  }
}


Otter.use(myPlugin)


// Otter.use(Otter.Plugins.MongoConnection({
//   db: 'mongodb://...'
// }))

Otter.use(Otter.Plugins.MemoryConnection)


async function spinup() {
  
  try {
    console.log('Starting')
    await Otter.start()
    console.log('Ready')
    
    let m = new MyModel()
    
    m.save()
    
  }
  catch (error) {
    console.log(error)
  }
}


spinup()



// MyModel.findOne({ })
// MyModel.find({ })
// MyModel.update({ })
// MyModel.delete({ })
