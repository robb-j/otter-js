const OtterError = require('./OtterError')

function format(attr, rest) {
  return `${attr.modelName}.${attr.name} - ${rest}`
}

OtterError.registerTypes('attr', {
  opts: {
    protectIsBool: (attr) => format(attr, `'protect' must be a Boolean`),
    requiredIsBool: (attr) => format(attr, `'required' must be a Boolean`),
    invalidEnum: (attr) => format(attr, `Invalid enum`),
    invalidEnumVals: (attr, type) => format(attr, `Invalid enum values, must be '${type}'`),
    invalidValidator: (attr) => format(attr, `Invalid validator`)
  },
  relation: {
    missingModel: (attr) => format(attr, `No model specified, pass a 'model' option`),
    invalidModel: (attr, modelName) => format(attr, `Invalid model specified '${modelName}'`)
  },
  hasMany: {
    noVia: (attr) => format(attr, `No 'via' attribute specified`),
    missingVia: (attr, targetType, targetAttr) => format(attr, `'via' attribute is missing, looking for '${targetType}.${targetAttr}'`),
    invalidVia: (attr, targetType, targetAttr) => format(attr, `'via' attribute (${targetType}.${targetAttr}) is not a HasOne to ${attr.modelName}`),
    invalidRemove: (attr) => format(attr, `Unkown args passed to .remove()`)
  }
})

module.exports = class AttributeError extends OtterError {
  
}
