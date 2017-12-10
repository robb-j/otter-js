const Otter = require('./Otter')

class Entity extends Otter.Types.Model {
  static attributes() {
    return {
      name: String,
      comp: { poly: [ 'StringComponent', 'NumberComponent' ] }
    }
  }
}

class StringComponent extends Otter.Types.Cluster {
  static attributes() {
    return { name: String, value: String }
  }
}

class NumberComponent extends Otter.Types.Cluster {
  static attributes() {
    return { name: String, value: Number }
  }
}

;(async () => {
  try {
    
    
    const url = 'mongodb://127.0.0.1:27017/otter'
    
    await Otter.use(Otter.Plugins.MongoConnection, { url })
      .addCluster(StringComponent)
      .addCluster(NumberComponent)
      .addModel(Entity)
      .start()
    
    
    
    
    
    // Create an Entity
    // let geoff = new Entity({ name: 'Geoff' })
    // let geoff = await Entity.find('5a2c62373056374e16f2f325').first()
    
    // console.log(geoff.values)
    
    // console.log(geoff)
    // console.log(geoff.values)
    
    // geoff.comp = new StringComponent({ name: 'title', value: 'Geoff' })
    
    // console.log(geoff.values)
    
    // geoff.comp = new NumberComponent({ name: 'age', value: 42 })
    
    // console.log(geoff.values)
    
    // geoff.comp = null
    
    // console.log(geoff.values)
    
    // await geoff.save()
    
    // Exit (no #teardown ...yet)
    process.exit()
  }
  catch (error) {
    console.error('error', error)
  }
})()
