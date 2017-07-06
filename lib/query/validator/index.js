

// function QueryValidator(value, type) {
//

// }


let compOps = [ '<', '>', '>=', '<=' ]
let logicOps = [ 'and', 'or' ]



let QueryValidator = {
  
  value(value, type) {
    return typeof value === type
  },
  
  regex(value, type) {
    return type === 'string' && value instanceof RegExp
  },
  
  comparison(value, type) {
    if (type !== 'number') return false
    if (typeof value !== 'object') return false
    let keys = Object.keys(value)
    if (keys.length !== 1) return false
    return compOps.includes(keys[0]) && typeof value[keys[0]] === 'number'
  },
  
  logical(value, type) {
    if (typeof value !== 'object') return false
    let keys = Object.keys(value)
    if (keys.length !== 1) return false
    let op = keys[0]
    let exprs = value[op]
    if (!logicOps.includes(op) || !Array.isArray(exprs)) return false
    
    for (let i in exprs) {
      exprs[i] = this.process(exprs[i], type)
      if (exprs[i] === null) return false
    }
    
    return true
  },
  
  inList(value, type) {
    if (!Array.isArray(value)) return false
    return value.reduce((correct, val) => {
      return correct && typeof val === type
    }, true)
  }
  
}


Object.defineProperty(QueryValidator, 'process', {
  value: process, enumerable: false, writable: false
})


function process(value, type) {
  
  for (let exprType in this) {
    if (this[exprType](value, type)) {
      return { type: exprType, value }
    }
  }
  return null
}








module.exports = QueryValidator
