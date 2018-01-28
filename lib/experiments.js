const Otter = require('.')
// const MongoAdapter = require('./adapters/MongoAdapter')

class Entity extends Otter.Types.Model {
  static attributes() {
    return {
      name: String,
      frame: { nestOne: 'Frame' }
    }
  }
}

class Other extends Otter.Types.Model {
  static attributes() {
    return {
      home: { type: String, default: 'Bobby' },
      body: { hasOne: 'Entity' }
    }
  }
}

class Size extends Otter.Types.Cluster {
  static attributes() {
    return { width: Number, height: Number }
  }
}

class Vector2 extends Otter.Types.Cluster {
  static attributes() {
    return { x: Number, y: Number }
  }
}

class Frame extends Otter.Types.Cluster {
  static attributes() {
    return {
      size: { nestOne: 'Size' },
      pos: { nestOne: 'Vector2' },
      history: { nestMany: 'Vector2' }
    }
  }
}




;(async () => {
  try {
    
    const url = 'mongodb://127.0.0.1:27017/otter'
    
    await Otter.use(Otter.Plugins.MemoryConnection, { url })
      .addCluster(Size, Vector2, Frame)
      .addModel(Entity, Other)
      .start()
    
    // ...
    
    // Exit (no Otter#teardown ... yet)
    process.exit()
  }
  catch (error) {
    console.error('error', error)
    process.exit()
  }
})()
