const Otter = require('./Otter')

class Entity extends Otter.Types.Model {
  static attributes() {
    return {
      name: String,
      comps: { nestMany: 'Component' }
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
    
    const url = 'mongodb://127.0.0.1:27017/otter'
    
    await Otter.use(Otter.Plugins.MongoConnection, { url })
      .addCluster(Component)
      .addModel(Entity)
      .start()
    
    
    // Create an Entity
    let geoff = new Entity({ name: 'Geoff' })
    
    
    // Push a component on the end
    geoff.comps.push(new Component({ name: 'weight', size: 11 }))
    
    
    // Push a component on the end via object
    geoff.comps.push({ name: 'age', size: 37 })
    
    
    // Asign new components (via objects)
    geoff.comps = [
      { name: 'weight', size: 9 },
      { name: 'height', size: 180 }
    ]
    
    
    // Store the entity
    await geoff.save()
    
    
    // let geoff = await Entity.findOne('5a2878f0c213443909a6a7c0').first()
    //
    // geoff.comps.push({ name: 'age', size: 42 })
    //
    // geoff.comps = geoff.comps.filter(comp => {
    //   return comp.name !== 'height'
    // })
    //
    // geoff.comps = geoff.comps.pop()
    //
    // await geoff.save()
    
    
    // Exit (no #teardown ...yet)
    // process.exit()
  }
  catch (error) {
    console.error('error', error)
  }
})()
