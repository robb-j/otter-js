const Model = require('./Model')
const Adapter = require('./Adapter')
const Attribute = require('./Attribute')
const Query = require('./Query')

const utils = require('./utils')
const plugins = require('./plugins')
const attributes = require('./attributes')
const exprs = require('./expressions')



/**
 * The base point for using Otter, configurable by using plugins.
 * Configure by defining plugins that add custom models and fields and setting up your database connection.
 * Plugins are an object with an install(Otter, args...) function that can call functions on Otter.
 * Plugins can call {@link addModel}, `addAttribute` & `addAdapter` to configure Otter.
 * Start Otter with `await Otter.start()`, remember to try-catch to find any configuration errors.
 * Once started any reference to your model classes are active and ready to use
 * @type {Otter}
 */
let Otter = {
  
  /** Things that have been activated on the Otter instance,
    these values are shallow copied on extend. Set through utils.makePluginable */
  _active: null,
  
  
  
  Utils: utils,
  
  Plugins: plugins,
  
  Types: { Model, Adapter, Attribute, Query },
  
  
  
  /**
   * Adds a plugin to Otter
   * @param {function|Object} plugin The plugin to install
   * @param {any} args Extra arguements to pass to the plugin
   * @return {Otter} Returns 'this' for chaining
   */
  use(plugin, ...args) { },
  
  
  
  /**
   * Extend Otter returning a customisable subclass which
   * doesn't affect the parent, forking it at the current time
   * @return {Otter} The new subclass
   */
  extend() {
    let pup = Object.assign({}, this)
    
    // Do a copy of arrays and objects containing active things
    // -> The things themselves (plugins, models etc are not copied)
    pup.active = {}
    for (let prop in this.active) {
      
      // If an array, use slice to copy contents
      if (Array.isArray(this.active[prop])) {
        pup.active[prop] = this.active[prop].slice()
      }
      
      // If an object, use assign to copy values
      else if (typeof this.active[prop] === 'object') {
        pup.active[prop] = Object.assign({}, this.active[prop])
      }
    }
    
    // Return the new Otter
    return pup
  },
  
  
  /**
   * Starts up Otter, finalising all plugins, models & attributes
   * @return {Otter}
   */
  async start() {
    
    if (Object.keys(this.active.adapters).length === 0) {
      throw new Error('No Adapters added')
    }
    
    // Register defauls, ignoring them if already registered (overidden)
    for (let i in attributes) {
      try { this.addAttribute(attributes[i]) }
      catch (e) { /* Ignore already registed errors on purpose */ }
    }
    
    // Register default attributes
    for (let exprType in exprs) {
      this.addQueryExpr(exprType, exprs[exprType])
    }
    
    this.Types.Query.exprs = this.active.exprs
    
    
    let errors = []
    
    // loop through models
    for (let modelName in this.active.models) {
      
      // Get a reference to the model
      let model = this.active.models[modelName]
      
      // Check adapter exists or throw an error
      let adapterName = model.adapterName()
      if (!this.active.adapters[adapterName]) {
        throw new Error(`${model.name}: Invalid adapterName '${model.adapterName()}'`)
      }
      
      
      // Set the adapter on the model
      let adapter = this.active.adapters[adapterName]
      let schema = {}
      
      
      // Loop through model's attributes
      let modelAttributes = model.collectAttributes()
      for (let attrName in modelAttributes) {
        
        // Parse the raw attribute
        let attribute = utils.parseAttribute(
          modelAttributes[attrName],
          this.active.attributes,
          attrName,
          modelName
        )
        
        // Check adapter supports the attribute
        if (!adapter.supportsAttribute(attribute)) {
          let adapterType = utils.getClass(adapter).name
          let attrType = utils.getClass(attribute).name
          
          throw new Error(`Adapter '${adapterType}' does not support '${attrType}' Attribute from ${modelName}.${attrName}`)
        }
        
        // Give the attribute chance to validate itself
        attribute.validateSelf(this, model)
        
        // Store the attribute on the model's schema
        schema[attrName] = attribute
      }
      
      
      // Store the schema on the model
      model._schema = schema
      
      // Store the adapter on the model
      model._adapter = adapter
      
      
      // Add the model to the adapter
      adapter.models[modelName] = model
    }
    
    // Setup adapters with > 1 model
    // Loop models on an adapter
    //  - Set adapter on model
    //  - Register model on adapter
    await Promise.all(Object.keys(this.active.adapters).map(name => {
      return this.active.adapters[name].setup(this)
    }))
    
    return this
  },
  
  
  
  /**
   * Registers a model to use with Otter
   * @param {Model} model The model class to register
   */
  addModel(model) {
    
    // Set the model or throw an error if it exists
    utils.setOrError(
      model,
      model.name,
      this.active.models,
      'Model already registered'
    )
    
    // Return Otter for chaining
    return this
  },
  
  
  
  /**
   * Registers an attribute to be used on a model
   * @param {Attribute} attribute The attribute class to register
   */
  addAttribute(attribute) {
    
    // Set the attribute or throw an error if it exists
    utils.setOrError(
      attribute,
      attribute.name,
      this.active.attributes,
      'Attribute already registered'
    )
    
    // Return Otter for chaining
    return this
  },
  
  
  
  /**
   * Registers an adapter for Otter to connect to a database
   * @param {Adapter} adapter The adapter class to register
   */
  addAdapter(adapter) {
    
    // Set the adapter or throw an error if it exists
    utils.setOrError(
      adapter,
      adapter.name,
      this.active.adapters,
      'Adapter already registered'
    )
    
    // Return Otter for chaining
    return this
  },
  
  
  
  /**
   * Adds a QueryBuilder, used to modify queries into Query objects
   * @param {function} builder The QueryBuilder to add
   */
  addQueryBuilder(builder) {
    
    if (typeof builder !== 'function') {
      throw new Error('Invalid QueryBuilder')
    }
    
    if (builder.length !== 2) {
      throw new Error('Invalid QueryBuilder Parameters')
    }
    
    this.active.queryBuilders.push(builder)
  },
  
  
  
  /**
   * Registers a type of query expression that are part of queries
   * @param {String} exprType The name of type of expression
   * @param {function} expr The expression definition, a function which validates it
   */
  addQueryExpr(exprType, expr) {
    
    if (typeof expr !== 'function') {
      throw new Error('Invalid QueryExpr')
    }
    
    this.active.exprs[exprType] = expr
  }
  
}

utils.makePluginable(Otter, {
  plugins: [],
  models: {},
  adapters: {},
  queryBuilders: [],
  attributes: {},
  exprs: {}
})


module.exports = Otter
