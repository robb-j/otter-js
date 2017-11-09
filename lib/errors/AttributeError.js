const OtterError = require('./OtterError')

function format(attr, rest) {
  return `${attr.modelName}.${attr.name}: ${rest}`
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
    missingModel: (attr) => format(attr, `No model specified, pass a 'model' option`)
  },
  hasMany: {
    noVia: (attr) => format(attr, `No 'via' attribute specified`)
  }
})

module.exports = class AttributeError extends OtterError {
  
}
