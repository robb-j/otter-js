const Otter = require('./Otter')

class Entity extends Otter.Types.Model {
  static attributes() {
    return {
      name: String,
      comps: { nestOne: 'Component' }
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
    
    
    let geoff = new Entity({ name: 'Geoff' })
    await geoff.save()
    
    
    
    // Grab the components (shallow copy) -> []
    console.log(geoff.comps)
    
    // Add a component
    geoff.comps.push(new Component({ name: 'weight', size: 11 }))
    
    // Asign new components
    geoff.comps = [
      { name: 'weight', size: 9 },
      { name: 'height', size: 180 }
    ]
    
    // ...
    
  }
  catch (error) {
    console.error('error', error.message)
  }
})()
