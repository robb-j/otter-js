const Otter = require('.')
const MongoAdapter = require('./adapters/MongoAdapter')

class Entity extends Otter.Types.Model {
  static attributes() {
    return {
      name: String,
      frame: { nestOne: 'Frame' }
    }
  }
}

// class StringComponent extends Otter.Types.Cluster {
//   static attributes() {
//     return { key: String, value: String }
//   }
// }
//
// class NumberComponent extends Otter.Types.Cluster {
//   static attributes() {
//     return { key: String, value: Number }
//   }
// }

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
    
    // const mongoAdapter = new MongoAdapter({ url })
    
    await Otter.use(Otter.Plugins.MongoConnection, { url })
      .addCluster(Size)
      .addCluster(Vector2)
      .addCluster(Frame)
      .addModel(Entity)
      .start()
    
    
    // Remove previous entities
    await Entity.destroy('all')
    
    
    // Create some Entities
    await Entity.create([
      {
        name: 'Geoff',
        frame: {
          size: { width: 10, height: 5 },
          pos: { x: 3, y: 3 },
          history: [
            { x: 2, y: 3 },
            { x: 2, y: 2 },
            { x: 3, y: 2 }
          ]
        }
      },
      {
        name: 'Tommy',
        frame: {
          size: { width: 15, height: 10 },
          pos: { x: 3, y: 3 },
          history: [
            { x: 4, y: 2 },
            { x: 4, y: 3 }
          ]
        }
      }
    ])
    
    
    // Find Entities which have a large frame
    let fatEntities = await Entity.find({
      frame: {
        size: { width: { '>': 5 } }
      }
    })
    console.log('fatties')
    console.log(JSON.stringify(fatEntities))
    console.log()
    
    
    // Find entities outside on the X axis
    let borderEntities = await Entity.find({
      frame: {
        history: {
          x: { or: [ { '<': 2 }, { '>': 3 } ] }
        }
      }
    })
    console.log('bored')
    console.log(JSON.stringify(borderEntities))
    console.log()
    
    
    // Exit (no #teardown ...yet)
    process.exit()
  }
  catch (error) {
    console.error('error', error)
    process.exit()
  }
})()
