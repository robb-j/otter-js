const collectObjectProperty = require('./collectObjectProperty')
const OtterError = require('../errors/OtterError')

/**
 * Parses attribute data into an Attribute instance
 * @param  {any} raw The attribute data to parse
 * @param  {class[]} types The Attribute types available to create
 * @param  {string} attrName  The name of the attribute
 * @param  {string} modelName The name of the model the attrbute belongs to
 * @return {Attribute} A new attribute instance
 */
module.exports = function parseAttributes(raw, types, attrName, modelName) {
  
  // Get the type and options from the raw input
  let type = getAttributeType(raw)
  let options = getAttributeOptions(raw)
  
  
  // If we couldn't work out a type, try using 'customNameMap' on the attributes
  if (!type && typeof raw === 'object') {
    ({ type, options } = tryCustomTypes(raw, types))
  }
  
  
  // Fail if we couldn't work out the type
  if (!type) {
    throw OtterError.fromCode('attr.parser.unknownType', modelName, attrName)
  }
  
  
  // Fail if we don't recognise the type
  if (!types[type]) {
    throw OtterError.fromCode('attr.parser.invalidType', modelName, attrName, type)
  }
  
  
  // Create a new attribute using its type and passing the options
  return new types[type](attrName, modelName, options)
}


/** Try to get an attribute type from a raw input & optionally to recurse objects */
function getAttributeType(raw, shouldRecurse = true) {
  if (typeof raw === 'function') { return raw.name }
  if (typeof raw === 'string') { return raw }
  if (typeof raw === 'object' && shouldRecurse && raw.type) {
    return getAttributeType(raw.type, false)
  }
  return null
}

/** Try to get the type & options from a raw input using attribute's customNameMap */
function tryCustomTypes(raw, types) {
  
  // Fail if not exactly 1 key
  let allKeys = Object.keys(raw)
  if (allKeys.length !== 1) return { type: null, options: null }
  
  
  // Get the primary key
  let primaryKey = allKeys[0]
  
  
  // Check through each available type
  for (let typeName in types) {
    
    // Collect the property, traversing the class hierachy
    let customNameMap = collectObjectProperty(types[typeName], 'customNameMap')
    
    // If found, return the type & mapped options
    if (customNameMap[primaryKey]) {
      return {
        type: typeName,
        options: {
          type: typeName,
          [customNameMap[primaryKey]]: raw[primaryKey]
        }
      }
    }
  }
  
  // If not found, default to null
  return { type: null, options: null }
}

/** Get the options from a raw input */
function getAttributeOptions(raw) {
  return typeof raw === 'object' ? raw : {}
}
