const parseAttribute = require('./parseAttribute')
const getClass = require('./getClass')

module.exports = function prepareClusters(Otter, clusters) {
  
  const { adapters, attributes } = Otter.active
  
  for (let name in clusters) {
    
    // Get a reference to the model
    let cluster = clusters[name]
    
    
    // Check adapter exists or throw an error
    let adapterName = cluster.adapterName()
    if (!adapters[adapterName]) {
      throw new Error(`${cluster.name}: Invalid adapterName '${cluster.adapterName()}'`)
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
        let attrType = getClass(attribute).name
        
        throw new Error(`Adapter '${adapterType}' does not support '${attrType}' Attribute from ${name}.${attrName}`)
      }
      
      // Store the attribute on the model's schema
      schema[attrName] = attribute
    }
    
    
    // Store the schema on the model
    cluster._schema = schema
    
    
    // Store the adapter on the model
    cluster._adapter = adapter
    
    
    // Add the model to the adapter
    adapter.models[name] = cluster
  }
  
  
  // Validate each model's attributes
  for (let name in clusters) {
    let cluster = clusters[name]
    
    // Loop through the model's attributes
    for (let attrName in cluster.schema) {
      let attr = cluster.schema[attrName]
      
      // Give the attribute chance to validate itself
      attr.validateSelf(Otter, cluster)
      
      // Let the attribute process its options
      attr.processOptions(Otter, cluster)
    }
  }
  
}
