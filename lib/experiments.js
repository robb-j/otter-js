const Otter = require('.')
const MongoAdapter = require('./adapters/MongoAdapter')

class Entity extends Otter.Types.Model {
  static attributes() {
    return {
      name: String,
      comps: { nestMany: 'NumberComponent' }
    }
  }
}

class StringComponent extends Otter.Types.Cluster {
  static attributes() {
    return { key: String, value: String }
  }
}

class NumberComponent extends Otter.Types.Cluster {
  static attributes() {
    return { key: String, value: Number }
  }
}




;(async () => {
  try {
    
    const url = 'mongodb://127.0.0.1:27017/otter'
    
    const mongoAdapter = new MongoAdapter({ url })
    // mongoAdapter.processors['includes'] = mongoProc.includes.bind(mongoAdapter)
    
    await Otter.addAdapter(mongoAdapter)
      .addCluster(StringComponent)
      .addCluster(NumberComponent)
      .addModel(Entity)
      .start()
    
    
    // await Entity.create([
    //   {
    //     name: 'Geoff',
    //     comps: [
    //       { key: 'Height', value: 180 },
    //       { key: 'Weight', value: 12 }
    //     ]
    //   },
    //   {
    //     name: 'Tommy',
    //     comps: [
    //       { key: 'Height', value: 210 },
    //       { key: 'Weight', value: 16 }
    //     ]
    //   }
    // ])
    
    
    let result = await Entity.find({
      comps: { value: 12 }
    })
    
    console.log(result)
    
    
    // console.log(Otter.Types.Query.exprs)
    
    
    // Exit (no #teardown ...yet)
    process.exit()
  }
  catch (error) {
    console.error('error', error)
    process.exit()
  }
})()
