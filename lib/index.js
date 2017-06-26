

console.log('\n\nStarting')

const Otter = require('./Otter')


let myPlugin = {
  install(Otter, a, b) {
    
    // Register a custom attribute
    /*
      Otter.attributes.String = { }
      Otter.addAttribute('MyAttribute', ...)
    */
    
    // Register a model
    /*
      Otter.models.MyModel = 'lol'
      Otter.addModel('MyModel', ...)
    */
   
    // Express style 'middleware' for query processing?
    Otter.queryBuilders.myBuilder = async (input, query) => { }
  }
}


Otter.use(myPlugin)


// Have some predefined plugins, e.g. for connections
// - Sets up an named adapter using those details
// - If no name, call it default
// - If default already exists, error
Otter.use(Otter.Plugins.MongoConnection({
  db: 'mongodb://...'
}))

Otter.use(Otter.Plugins.MemoryConnection())



// Boot Process ...
// - Validate attributes
// - Validate models to thier connection


// ORM
let { MyModel } = Otter.models

// MyModel.findOne({ })
// MyModel.find({ })
// MyModel.update({ })
// MyModel.delete({ })
