const Otter = require('.')

class Entity extends Otter.Types.Model {
  static attributes() {
    return {
      name: String,
      comps: { polyMany: [ 'StringComponent', 'NumberComponent' ] }
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
    
    await Otter.use(Otter.Plugins.MongoConnection, { url })
      .addCluster(StringComponent)
      .addCluster(NumberComponent)
      .addModel(Entity)
      .start()
    
    
    // let geoff = await Entity.create({
    //   name: 'Geoff',
    //   comps: [
    //     new StringComponent({ key: 'hat', value: 'beanie' }),
    //     new NumberComponent({ key: 'age', value: 42 })
    //   ]
    // })
    // console.log(geoff)
    
    
    let geoff = await Entity.find('5a35a4170b410b15a7684f97').first()
    console.log(geoff)
    console.log(geoff.comps)
    console.log(geoff.comps[0]._type)
    
    
    // Exit (no #teardown ...yet)
    process.exit()
  }
  catch (error) {
    console.error('error', error)
  }
})()
