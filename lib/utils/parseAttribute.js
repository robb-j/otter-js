/**
 * Parses attribute data into an Attribute instance
 * @param  {any} raw The attribute data to parse
 * @param  {class[]} types The Attribute types available to create
 * @param  {string} attrName  The name of the attribute
 * @param  {string} modelName The name of the model the attrbute belongs to
 * @return {Attribute} A new attribute instance
 */
module.exports = function(raw, types, attrName, modelName) {
  
  // Get the type and options from the raw input
  let type = getAttributeType(raw)
  let options = getAttributeOptions(raw)
  
  
  // Fail if we couldn't work out the type
  if (type === null) {
    throw new Error(`${modelName}.${attrName}: Could not determine type`)
  }
  
  
  // Fail if we don't recognise the type
  if (!types[type]) {
    throw new Error(`${modelName}.${attrName}: Invalid Type '${type}'`)
  }
  
  
  // Create a new attribute using its type and passing the options
  return new types[type](attrName, modelName, options)
}


function getAttributeType(raw, shouldRecurse = true) {
  if (typeof raw === 'function') { return raw.name }
  if (typeof raw === 'string') { return raw }
  if (typeof raw === 'object' && shouldRecurse) {
    return getAttributeType(raw.type, false)
  }
  return null
}

function getAttributeOptions(raw) {
  return typeof raw === 'object' ? raw : {}
}
