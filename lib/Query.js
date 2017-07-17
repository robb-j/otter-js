const { undefOrNull, getClass } = require('./utils')
const clone = require('clone')

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
  
  /**
   * Creates a new Query
   * @param  {String} modelName The name of the model being queried
   * @param  {String|Number|Object} [input={}] The filters of the query
   * @param  {Object} [options={}] The options of the query
   * @return {Otter.Types.Query}
   */
  constructor(modelName, input = {}, options = {}) {
    
    // Store the model name
    this.modelName = modelName
    
    // Setup properties
    this.where = null
    this.sort = null
    this.limit = null
    this.pluck = null
    
    
    // The keywords to look for in input
    let reserved = [ 'sort', 'limit', 'pluck' ]
    
    
    // Map those values onto ourself
    Object.keys(options).forEach((key) => {
      if (reserved.includes(key)) {
        this[key] = options[key]
      }
    })
    
    
    
    // Check if a shorthand was used
    
    
    // If a string was passed, do an id query
    if (typeof input === 'string' || typeof input === 'number') {
      this.where = { id: input }
    }
    else if (Array.isArray(input)) {
      
      // If an array of strings, map to an id array
      let allStrings = input.reduce((all, id) => {
        return all && typeof id === 'string'
      }, true)
      
      if (allStrings) {
        this.where = { id: input }
      }
      else {
        throw new Error(`Query: Array shorthand must be strings`)
      }
    }
    else if (typeof input === 'object') {
      
      // If an object, set that to our where
      this.where = input
    }
  }
  
  /**
   * Validates this query against a model's schema
   * @param  {object} schema The schema to validate against
   */
  validateOn(schema) {
    
    let processed = clone(this.where)
    
    // Validate the 'where'
    for (let attrName in processed) {
      
      let attribute = schema[attrName]
      
      if (!attribute) {
        throw new Error(`Cannot query unknown Attribute: ${this.modelName}.${attrName}`)
      }
      
      processed[attrName] = this.validateExpr(processed[attrName], attribute.valueType)
      
      if (!processed[attrName]) {
        let exprString = JSON.stringify(this.where[attrName])
        throw new Error(`${this.modelName}.${attrName}: Unrecognised query expression - ${exprString}`)
      }
    }
    
    this.processed = processed
    
    
    // Validate the 'sort'
    // -> [ 'age', 'desc name' ]
    
    // Validate the 'pluck'
    // -> [ 'id', 'name', 'age' ]
    
    // Validate the 'limit'
    // -> 7
    // -> { start: 3, length: 8 }
  }
  
  /**
   * Validates an expression against all registered expression types
   * @param  {any} expr The expression to validate
   * @param  {String} type The type to validate against, the type of the attribute
   * @return {object} The type and expression { type, expr }
   */
  validateExpr(expr, type) {
    
    // Get the expressions installed onto us
    let allExprs = getClass(this).exprs
    
    // See if any of them validates
    for (let exprType in allExprs) {
      if (allExprs[exprType].bind(this)(expr, type)) {
        return { type: exprType, expr }
      }
    }
    
    return null
  }
  
}

module.exports = Query
