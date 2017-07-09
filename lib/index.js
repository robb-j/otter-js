
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
   
    // Express style 'middleware' for query processing?
    // Otter.queryBuilders.myBuilder = async (input, query) => { }
  }
}


Otter.use(myPlugin)


// Otter.use(Otter.Plugins.MongoConnection({
//   db: 'mongodb://...'
// }))

Otter.use(Otter.Plugins.MemoryConnection);



(async () => {
  
  try {
    
    await Otter.start()
    
    await MyModel.createMany([
      { name: 'Geoff', age: 21 },
      { name: 'Terrance', age: 14 },
      { name: 'Bobby', age: 42 },
      { name: 'Billy', age: 19 }
    ])
    
    // let q = '2'
    // let q = [ '1', '3' ]
    // let q = { id: { '!': '1' } }
    // let q = { name: /^b/i }
    // let q = { age: { '>': 20 } }
    let q = { age: { and: [ {'>=': 19}, {'<': 27} ] } }
    
    let res = await MyModel.find(q)
    
    console.log()
    console.log(res)
    //
    // console.log(m)
    // console.log(JSON.stringify(m))
    
  }
  catch (error) {
    console.log(error.message)
  }
})()



// MyModel.findOne({ })
// MyModel.find({ })
// MyModel.update({ })
// MyModel.delete({ })
