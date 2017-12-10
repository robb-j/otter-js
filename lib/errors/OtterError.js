const getUsingDot = require('../utils/getUsingDot')
const setUsingDot = require('../utils/setUsingDot')

const ErrorTypes = {
  
  adapter: {
    invalidProcessor: () => `Invalid Processor: Should be a function`,
    unknownModel: (name) => `Cannot query unknown Model: '${name}'`,
    missingValues: () => `Cannot create/update without values`,
    unknownAttrs: (attrs) => `Cannot create/update with unknown Attributes: ${attrs}`,
    unsupportedExpr: (adapter, type) => `${adapter}: Unsupported expression ${type}`
  },
  
  mongoAdapter: {
    missingUrl: () => `MongoAdapter - requires a 'url' to connect to a mongodb`,
    notStarted: () => `MongoAdapter - Cannot query until setup using Otter.start()`
  },
  
  config: {
    noAdapters: () => `No Adapters added`,
    invalidQueryExpr: () => `Invalid QueryExpr`,
    invalidAdapter: (clusterName, adapterName) => `${clusterName}: Invalid adapterName '${adapterName}'`,
    unsupportedAttr: (adapterName, attr) => `Adapter '${adapterName}' doesn't support ${attr.constructor.name}, from ${attr.fullName}`
  },
  
  composite: (errors) => `Multiple errors were thrown: \n * ${errors.map(err => err.message).join('\n * ')}`
  
  // ...
}

module.exports = class OtterError extends Error {
  
  /** Creates a new Error with a given message */
  constructor(message, code) {
    super(message)
    this.code = code
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
  
  /**
   * Creates a new pre-defined error using its code and any args
   * @param  {string} code The error to create, using dot notation e.g. 'adapter.invalidProcessor'
   * @param  {...*}   args Arguements to pass to the error template
   * @return {this}
   */
  static fromCode(code, ...args) {
    let template = getUsingDot(code, ErrorTypes)
    if (!template) throw new Error(`OtterError - Invalid error code, ${code}`)
    if (template.length !== args.length) throw new Error(`OtterError - Invalid args for ${code}`)
    return new this(template.apply(this, args), code)
  }
  
  /**
   * Register custom error types to be used with ::fromCode
   * @param  {string} namespace The namespace to add the types under (can be dot notation)
   * @param  {object} types     A map of key => error template, where a template is a function that returns an error string. The function also takes any extra params passed to ::fromCode
   */
  static registerTypes(namespace, types) {
    setUsingDot(ErrorTypes, namespace, types)
  }
  
  /**
   * [composite description]
   * @param  {OtterError[]} errors The errors to compose
   * @return {OtterError}
   */
  static composite(errors) {
    let error = this.fromCode('composite', errors)
    error.subErrors = errors
    error.subCodes = errors.map(e => e.code)
    return error
  }
}
