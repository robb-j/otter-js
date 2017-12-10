const { getClass, undefOrNull } = require('./utils')
const formatObj = require('util').inspect
const OtterError = require('./errors/OtterError')
const clone = require('clone')


OtterError.registerTypes('query', {
  invalidShorthand: (idAttr) => `Query - Array shorthand values must match ${idAttr.constructor.name}`,
  unknownAttr: (model, attrName) => `Cannot query unknown Attribute: ${model}.${attrName}`,
  untypedAttr: (attr) => `Cannot query untyped attribute: ${attr.fullName}`,
  unknownExpr: (attr, expr) => `${attr.fullName} - Unrecognised expression ${expr}`
})


/**
 * A query in Otter, responsible for parsing raw queries passed to model classes and parsing them.
 * There are serveral shorthands:
 *  - null | {} => makes a query for everything
 *  - string | int => makes a query for a specific id
 *  - { key: val } => makes a query for that matches those values
 *  - { where: {}, limit: {}, sort: [], pluck: [] } is the full form, shorthands are parsed into this
 * @type {Otter.Types.Query}
 */
class Query {
  
  get modelName() { return this.model.name }
  
  /**
   * Creates a new Query
   * @param  {Class} model The name of the model being queried
   * @param  {String|Number|Object} [input={}] The filters of the query
   * @param  {Object} [options={}] The options of the query
   * @return {Otter.Types.Query}
   */
  constructor(model, input = {}, options = {}) {
    
    // Store the model name
    this.model = model
    
    // Setup properties
    this.where = null
    this.sort = null
    this.limit = null
    this.pluck = null
    this.singular = false
    
    
    // The keywords to look for in input
    let reserved = [ 'sort', 'limit', 'pluck' ]
    
    
    // Map those values onto ourself
    Object.keys(options).forEach((key) => {
      if (reserved.includes(key)) {
        this[key] = options[key]
      }
    })
    
    
    
    // Check if a shorthand was used
    
    // // TODO: Throw error if model not registered ...
    // if (!model.schema || !model.schema.id) {
    //   throw OtterError.fromCode('...')
    // }
    
    // If a string was passed, do an id query
    if (model.schema && model.schema.id && model.schema.id.valueMatchesType(input)) {
      this.where = { id: input }
    }
    else if (Array.isArray(input)) {
      
      // If an array of strings, map to an id array
      let allIds = input.reduce((all, id) => {
        return model.schema && model.schema.id && model.schema.id.valueMatchesType(id)
      }, true)
      
      // Fail if not a correct id array shorthand
      if (!allIds) throw OtterError.fromCode('query.invalidShorthand', model.schema.id)
      this.where = { id: input }
    }
    else if (typeof input === 'object') {
      
      // If an object, set that to our where
      this.where = input
    }
    else {
      
      // TODO: throw an error
    }
  }
  
  /**
   * Makes the Query ready to be executed on a schema
   * @param  {object} schema The schema to prepare for
   */
  prepareForSchema(schema) {
    
    let processed = clone(this.where)
    
    // Validate the 'where'
    for (let attrName in processed) {
      
      // Grab the attribute from the model schema
      let attribute = schema[attrName]
      
      // Fail if it doesn't exist
      if (!attribute) {
        throw OtterError.fromCode('query.unknownAttr', this.modelName, attrName)
      }
      
      // Fail if it is untyped
      if (undefOrNull(attribute.valueType)) {
        throw OtterError.fromCode('query.untypedAttr', attribute)
      }
      
      // Validate the expression
      processed[attrName] = this.validateExpr(processed[attrName], attribute)
      
      // Fail if it couldn't be processed
      if (!processed[attrName]) {
        throw OtterError.fromCode('query.unknownExpr', attribute, formatObj(this.where[attrName]))
      }
    }
    
    this.processed = processed
  }
  
  /**
   * Validates an expression against all registered expression types
   * @param  {any} expr The expression to validate
   * @param  {Otter.Types.Attribute} attr The Attribute to validate against
   * @return {object} The type and expression { type, expr }
   */
  validateExpr(expr, attr) {
    
    // Get the expressions installed onto us
    let allExprs = getClass(this).exprs
    
    // See if any of them validates
    for (let exprType in allExprs) {
      if (allExprs[exprType].call(this, expr, attr)) {
      // if (allExprs[exprType].bind(this)(expr, attr)) {
        return { type: exprType, expr }
      }
    }
    
    return null
  }
  
}

module.exports = Query
