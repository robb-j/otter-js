
// module.exports = (Type) => class RelationType extends Type {

module.exports = function(...classList) {
  
  // if (classList.length === 0) throw new Error('Failed')
  
  // let last =
  //
  // return applyClassList(classList.splice(-1))
  
  return applyClassList(classList)
}


function applyClassList(classList) {
  
  if (classList.length === 0) throw new Error('Failed')
  
  if (classList.length === 1) {
    
    // return (SubType) => class extends SubType
    
  }
  
  // let x = [1, 2, 3].pop()
  
  // return class extends applyClassList(classList.slice(1)) { }
  
  
  
}
