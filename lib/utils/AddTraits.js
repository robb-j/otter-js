/**
 * Applies multiple traits to a base class, returning a new class to subclass.
 * A trait is defined as a function which returns a new class e.g.
 * const T = (Type) => class extends Type { ... }
 *
 * @param  {class} [baseClass]  The class to start from or null
 * @param  {...class} traits    The traits to apply
 * @constructor
 */
module.exports = function AddTraits(baseClass, ...traits) {
  
  // Create a subclass of the baseClass, or create a fresh class
  let newClass = (baseClass && class extends baseClass {}) || class { }
  
  // Apply each trait to the new class, creating a new class
  traits.forEach(trait => {
    newClass = trait(newClass)
  })
  
  // Return the class with the traits applied
  return newClass
}
