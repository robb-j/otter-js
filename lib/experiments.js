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


let expr = {
  elemHas(value, attr) {
    
    if (typeof value !== 'object' || !value.elemHas) return false
    if (!Otter.Utils.usesTrait(attr, 'AssociativeType')) return false
    if (attr.associationCategory() !== 'many') return false
    let Cluster = attr.associatedCluster()
    
    let exprs = value.elemHas
    
    for (let key in exprs) {
      if (!Cluster.schema[key]) return false
      exprs[key] = this.validateExpr(exprs[key], Cluster.schema[key])
      if (!exprs[key]) return false
    }
    return true
  }
}

let mongoProc = {
  elemHas(key, attr, expr) {
    
    let nested = Object.keys(expr.elemHas).reduce((nested, subkey) => {
      return Object.assign(nested, this.evaluateExpr(subkey, expr.elemHas[subkey]))
    }, {})
    
    console.log(nested)
    
    return {
      [key]: {
        $elemMatch: nested
      }
    }
  }
}




;(async () => {
  try {
    
    const url = 'mongodb://127.0.0.1:27017/otter'
    
    const mongoAdapter = new MongoAdapter({ url })
    mongoAdapter.processors['elemHas'] = mongoProc.elemHas.bind(mongoAdapter)
    
    await Otter.addAdapter(mongoAdapter)
      .addQueryExpr('elemHas', expr.elemHas)
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
      'comps': { elemHas: { value: 12 } }
    })
    
    console.log(result)
    
    
    // Exit (no #teardown ...yet)
    process.exit()
  }
  catch (error) {
    console.error('error', error)
    process.exit()
  }
})()
