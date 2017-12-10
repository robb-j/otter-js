const parseAttribute = require('./parseAttribute')
const getClass = require('./getClass')
const OtterError = require('../errors/OtterError')

module.exports = function prepareClusters(Otter, clusters, isModels = false) {
  
  const { adapters, attributes } = Otter.active
  
  for (let name in clusters) {
    
    // Get a reference to the model
    let cluster = clusters[name]
    
    
    // Check adapter exists or throw an error
    let adapterName = cluster.adapterName()
    if (!adapters[adapterName]) {
      throw OtterError.fromCode('config.invalidAdapter', cluster.name, cluster.adapterName())
    }
    
    
    // Set the adapter on the model
    let adapter = adapters[adapterName]
    let schema = {}
    
    
    // Loop through model's attributes
    let modelAttributes = cluster.collectAttributes(adapter)
    for (let attrName in modelAttributes) {
      
      // Parse the raw attribute
      let attribute = parseAttribute(
        modelAttributes[attrName],
        attributes,
        attrName,
        name
      )
      
      // Check adapter supports the attribute
      if (!adapter.supportsAttribute(attribute)) {
        let adapterType = getClass(adapter).name
        throw OtterError.fromCode('config.unsupportedAttr', adapterType, attribute)
      }
      
      // Store the attribute on the model's schema
      schema[attrName] = attribute
    }
    
    
    // Add the schema & adapter to the model
    cluster._schema = schema
    cluster._adapter = adapter
    
    
    // If working with models, add to the adapter
    if (isModels) { adapter.models[name] = cluster }
  }
  
  
  // Validate each model's attributes
  for (let name in clusters) {
    clusters[name].validateSchema(Otter)
  }
  
}
