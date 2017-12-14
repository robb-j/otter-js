const Attribute = require('../Attribute')
const Cluster = require('../Cluster')
const { PolymorphicType, AddTraits } = require('../utils')


module.exports = class PolyManyAttribute extends AddTraits(Attribute, PolymorphicType) {
  
  static customNameMap() {
    return { polyList: 'clusters' }
  }
  
  get valueType() { return 'object' }
  
  get PolyTypes() { return this.options.Types }
  
  get enumOptions() { return null /* Don't allow enums */ }
  
  validateSelf(Otter, ModelType) {
    this.validateTypes(Otter, ModelType, this.options.clusters)
  }
  
  processOptions(Otter, ModelType) {
    this.options.Types = this.processTypes(Otter, ModelType, this.options.clusters)
  }
  
  
  installOn(model) {
    
    // Cache values for property
    let name = this.name
    let PolyTypes = this.PolyTypes
    let PolyTypeNames = this.PolyTypes.map(t => t.name)
    
    
    // function isValidType(value) {
    //   return PolyTypes.some(Type => value instanceof Type)
    // }
    
    // The cluster instance
    let clusters = null
    
    
    // const TypedArray = ClusterArray(ClusterType, () => model.values[name])
    // class PolyArray extends Array {
    //   push(...elems) {
    //
    //     let errors = []
    //
    //     elems.forEach(value => {
    //       let newValue =
    //     })
    //   }
    // }
    
    
    // ...
    Object.defineProperty(model, name, {
      enumerable: true,
      configurable: false,
      get() { return Array.from(clusters) },
      set(newValue) {
        
        // if (!Array.isArray(newValue)) return
        //
        // let correctlyTyped = newValue.every(elem => {
        //   return PolyTypes.some(Type => elem instanceof Type) ||
        //     (typeof elem === 'object' && PolyTypeNames.includes(elem._type))
        // })
        //
        // if (!correctlyTyped) return
        //
        // model.values[name] = newValue.map(elem => {
        //
        // })
        
      }
    })
  }
  
}
