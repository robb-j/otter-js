/**
 * Tests if a class implements a trait
 * @param  {any}    target     The class to test
 * @param  {string} traitName  The name of the class to test
 * @return {boolean}
 */
module.exports = function usesTrait(target, traitName) {
  let traits = typeof target === 'function'
    ? target.traits
    : target.constructor.traits
  return Array.isArray(traits) && traits.includes(traitName)
}
