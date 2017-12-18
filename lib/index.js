const Cluster = require('./Cluster')
const Model = require('./Model')
const Adapter = require('./Adapter')
const Attribute = require('./Attribute')
const Query = require('./Query')
const OtterError = require('./errors/OtterError')
const QueryPromise = require('./promises/QueryPromise')

const utils = require('./utils')
const plugins = require('./plugins')
const attributes = require('./attributes')
const exprs = require('./expressions')

const { prepareClusters, makePluginable } = utils

function formatAttrName(AttrType) {
  return AttrType.name.replace(/Attribute$/, '')
}



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
  
  Utils: utils,
  
  Plugins: plugins,
  
  Error: OtterError,
  
  Types: { Model, Cluster, Adapter, Attribute, Query, QueryPromise },
  
  
  
  /**
   * Adds a plugin to Otter (from makePluginable)
   * @param {function|Object} plugin The plugin to install
   * @param {any} args Extra arguements to pass to the plugin
   * @return {Otter} Returns 'this' for chaining
   */
  use(plugin, ...args) { },
  
  
  
  /**
   * Extend Otter returning a customisable subclass which
   * doesn't affect the parent, forking it at the current time
   * (from makePluginable)
   * @return {Otter} The new subclass
   */
  extend() { },
  
  
  
  /**
   * Starts up Otter, finalising all plugins, models & attributes
   * @return {Otter}
   */
  async start() {
    
    if (Object.keys(this.active.adapters).length === 0) {
      throw OtterError.fromCode('config.noAdapters')
    }
    
    // Register defauls, ignoring them if already registered (overidden)
    for (let i in attributes) {
      let name = formatAttrName(attributes[i])
      if (!this.active.attributes[name]) {
        this.active.attributes[name] = attributes[i]
      }
    }
    
    // Register default attributes
    for (let exprType in exprs) {
      this.addQueryExpr(exprType, exprs[exprType])
    }
    
    this.Types.Query.exprs = this.active.exprs
    
    
    // Prepare clusters
    prepareClusters(this, this.active.clusters)
    
    // Then prepare models
    prepareClusters(this, this.active.models, true)
    
    
    // Validate cluster's attributes
    for (let name in this.active.clusters) {
      this.active.clusters[name].validateSchema(this)
    }
    
    // Validate model's attributes
    for (let name in this.active.models) {
      this.active.models[name].validateSchema(this)
    }
    
    
    // Setup adapters with ≥ 1 model
    // Loop models on an adapter
    //  - Set adapter on model
    //  - Register model on adapter
    await Promise.all(Object.keys(this.active.adapters).map(name => {
      return this.active.adapters[name].setup(this)
    }))
    
    return this
  },
  
  async stop() {
    
    // TODO: Implement teardowns
    
    // Unset adapters on models/clusters
    
    // Unset schemas on models/clusters
    
    // Unset query exors
    
    // teardown active adapters
  },
  
  
  
  /**
   * Registers a model to use with Otter
   * @param {Otter.Types.Model} ModelType The model class to register
   * @return {Otter}
   */
  addModel(ModelType) {
    
    // Set the model
    this.active.models[ModelType.name] = ModelType
    
    // Return Otter for chaining
    return this
  },
  
  
  
  /**
   * Registers a cluster to use with Otter
   * @param {Otter.Types.Cluster} ClusterType The cluster class to register
   * @return {Otter}
   */
  addCluster(ClusterType) {
    
    // Set the cluster
    this.active.clusters[ClusterType.name] = ClusterType
    
    // Return Otter for chaining
    return this
  },
  
  
  
  /**
   * Registers an attribute to be used on a model
   * @param {Attribute} AttrType The attribute class to register
   * @return {Otter}
   */
  addAttribute(AttrType) {
    
    // Set the attribute
    this.active.attributes[formatAttrName(AttrType)] = AttrType
    
    // Return Otter for chaining
    return this
  },
  
  
  
  /**
   * Registers an adapter for Otter to connect to a database
   * @param {Adapter} adapter The adapter class to register
   * @return {Otter}
   */
  addAdapter(adapter) {
    
    // Set the adapter
    this.active.adapters[adapter.name] = adapter
    
    // Return Otter for chaining
    return this
  },
  
  
  
  /**
   * Registers a type of query expression that are part of queries
   * @param {String} exprType The name of type of expression
   * @param {function} expr The expression definition, a function which validates it
   * @return {Otter}
   */
  addQueryExpr(exprType, expr) {
    
    if (typeof expr !== 'function') {
      throw OtterError.fromCode('config.invalidQueryExpr')
    }
    
    this.active.exprs[exprType] = expr
    
    // Return Otter for chaining
    return this
  }
  
}

makePluginable(Otter, {
  plugins: [],
  models: {},
  clusters: {},
  adapters: {},
  attributes: {},
  exprs: {}
})


module.exports = Otter
