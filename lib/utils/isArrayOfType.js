
module.exports = function isArrayOfType(Type, value) {
  return Array.isArray(value) && value.reduce((flag, elem) => {
    return flag && elem instanceof Type
  }, true)
}
