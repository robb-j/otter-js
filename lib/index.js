const Otter = require('./Otter')

class Entity extends Otter.Types.Model {
  static attributes() {
    return {
      name: String,
      comp: { nestOne: 'Component' }
    }
  }
}

class Component extends Otter.Types.Cluster {
  static attributes() {
    return { name: String, size: Number }
  }
}

;(async () => {
  try {
    
    await Otter.use(Otter.Plugins.MemoryConnection)
      .addCluster(Component)
      .addModel(Entity)
      .start()
    
    
    
    let geoff = new Entity({ name: 'Geoff', comp: { name: 'Age', size: 42 } })
    
    console.log(geoff)
    
    await geoff.save()
    
    console.log(geoff)
    console.log(geoff.comp)
    console.log(geoff.comp.name)
    console.log(geoff.comp.size)
    
  }
  catch (error) {
    console.error('error', error.message)
  }
})()
