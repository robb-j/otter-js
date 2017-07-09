/** @type MemoryExprProcessor  */
module.exports = function(expr, value) {
  let op = Object.keys(expr)[0]
  let comp = expr[op]
  switch (op) {
    case '>': return value > comp
    case '<': return value < comp
    case '>=': return value >= comp
    case '<=': return value <= comp
  }
  return false // Just to be safe?
}
