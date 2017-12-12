// const undefOrNull = require('../undefOrNull')
//
// module.exports = function mergeUsingDot(object, key, value) {
//
//   let current = object
//
//   let keys = key.split('.')
//   keys.forEach((subkey, i) => {
//
//     // If a value at this level isn't defined, set it to an object
//     if (undefOrNull(current[subkey])) {
//       current[subkey] = {}
//     }
//
//     // If at the end, merge the value in
//     if (i === keys.length - 1) {
//       Object.assign(current[subkey], value)
//     }
//     else {
//
//       // If not add the end, update the reference for the next loop
//       current = current[subkey]
//     }
//   })
// }
