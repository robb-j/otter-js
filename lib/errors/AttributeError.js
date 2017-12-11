const OtterError = require('./OtterError')

function format(attr, rest) {
  return `${attr.modelName}.${attr.name} - ${rest}`
}

OtterError.registerTypes('attr', {
  parser: {
    unknownType: (modelName, attrName) => `${modelName}.${attrName} - Could not determine type`,
    invalidType: (modelName, attrName, type) => `${modelName}.${attrName} - Invalid Type '${type}'`
  },
  opts: {
    protectIsBool: (attr) => format(attr, `'protect' must be a Boolean`),
    requiredIsBool: (attr) => format(attr, `'required' must be a Boolean`),
    invalidEnum: (attr) => format(attr, `Invalid enum`),
    invalidEnumVals: (attr, type) => format(attr, `Invalid enum values, must be '${type}'`),
    invalidValidator: (attr) => format(attr, `Invalid validator`)
  },
  validation: {
    missing: (attr) => format(attr, `Missing required value`),
    type: (attr, val) => format(attr, `invalid type '${typeof val}', value '${val}'`),
    enum: (attr, val) => format(attr, `${typeof val} '${val}' is not in enum [${attr.enumOptions.join(',')}]`),
    custom: (attr, val) => format(attr, `${typeof val} '${val}' failed custom validator`)
  },
  relation: {
    missingModel: (attr) => format(attr, `No model specified, pass a 'model' option`),
    invalidModel: (attr, modelName) => format(attr, `Invalid model specified '${modelName}'`)
  },
  hasMany: {
    noVia: (attr) => format(attr, `No 'via' attribute specified`),
    missingVia: (attr, targetType, targetAttr) => format(attr, `'via' attribute is missing, looking for '${targetType}.${targetAttr}'`),
    invalidVia: (attr, targetType, targetAttr) => format(attr, `'via' attribute (${targetType}.${targetAttr}) is not a HasOne to ${attr.modelName}`),
    invalidRemove: (attr) => format(attr, `Unknown args passed to .remove()`)
  },
  nesting: {
    missingCluster: (attr) => format(attr, `No cluster specified, pass a 'cluster' option`),
    invalidCluster: (attr, cluster) => format(attr, `Invalid cluster '${cluster}', either it is not registered or on a different adapter to the owner`)
  }
})

module.exports = class AttributeError extends OtterError {
  
}
