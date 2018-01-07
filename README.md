# Otter ORM

A modern extendable ORM for javascript ~ (WIP!)

## A Simple Example

```js
const Otter = require('otterjs');

class Wizard extends Otter.Types.Model {
  static attributes() {
    return { name: String, age: Number };
  }
}

(async () => {
  
  // Register our model, add a database connection and start up
  await Otter.addModel(Wizard)
    .use(Otter.Plugins.MemoryConnection)
    .start();
  
  // Create some wizards
  await Wizard.create([
    { name: 'Gandalf', age: 2019 },
    { name: 'Albus Dumbledore', age: 150 },
    { name: 'Dr Strange', age: 57 },
    { name: 'Wizzard', age: 28 }
  ]);
  
  // Get wizards which are older that 150
  let matches = await Wizard.find({ age: { '>': 150 } });
  
  // Set a wizard's age to 99 if their name has an 'o' in it
  await Wizard.update({ name: /o/ }, { age: 99 });
  
  // Delete any wizards with the name 'Harry Otter'
  await Wizard.destroy({ name: 'Harry Otter' });
  
})();
```



## Using Models

Models are your connection to the database, they are ES6 Classes which subclass `Otter.Types.Model` and define groups of fields you want to store in a database. Once defined they are then used to create, update and query records from your database.

### Attributes

Models define attributes which are the fields you want to be stored. This is done by defining `static attributes()` on your Model, which returns attribute names and their corresponding type.

```js
class Hero extends Otter.Types.Model {
  
  static attributes() {
    return {
      name: String,
      height: Number,
      birthday: Date,
      isCool: Boolean
    };
  }
}
```

Attributes can be defined in a couple of ways, you can use the shorthand by passing a native type, like above. You can also pass a String instead, e.g. `String` or `Number`. For all the Attributes you can use see [Available Attributes](#available-attributes).

```js
let moreAttributes = {
  age: {
    type: Number,
    default: 42,
    validator(value) { return value >= 0 }
  },
  weapon: {
    type: String,
    enum: [ 'Sword', 'Bow', 'Axe', 'Hammer' ]
  }
};
```

You can also provide a full definition like `age` or `weapon`, here you pass the type (which accepts the same values as the shorthand) along with other options. For the available options and more info see [Attribute Options](#attribute-options).

### Starting up Otter

Once you have a Model, you can start using it to talk to your database. First you'll have to let Otter know about your Model and get Otter started up. Starting is asynchronous, so we'll need run this in an async block. [More info about async-await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

```js
(async () => {
  
  // Register our Model
  Otter.addModel(Wizard);
  
  // Connect to a Mongo database
  Otter.use(Otter.Plugins.MongoConnection, { url: 'mongodb://...' });
  
  // Startup Otter
  await Otter.start();
  
})();
```

There are a few things here, firstly we're registering our Model with `Otter.addModel()`, this lets Otter know we want to use this model. Otter won't do anything with our model, yet, but its ready for when we start it up.

Next we use a Plugin to register our connection to our mongo database (you'll of course need to set your [Mongo URI](https://docs.mongodb.com/manual/reference/connection-string/)). The plugin system lets package authors define units of code that can be added to Otter in one go, for more info see [More About Plugins](#plugins).

The final step is to start up Otter, this lets otter perform all the checks it needs and gets your Models ready for use. It checks your Model's attributes are all of your configured correctly and throws errors if not (or the promise will reject if not using async-await). For all of the errors that can be thrown see [Otter Errors](#errors).

### Creating a Record

```js
(async () => {
  
  // Create a wizard
  let gandalf = new Wizard({ name: 'Gandalf', age: 2018 });
  
  // Set his age
  gandalf.age = 2019;
  
  // Save him into the database
  await gandalf.save();
  
  // Remove Gandalf
  await gandalf.destroy();
  
})();
```

Now Otter is started, we can do the interesting stuff! We create our first wizard, Gandalf. You can use your model just like any ES6 class. Set the values you want to store on your model and call `save()` to write your record into the database. If you got the model from a query, save will update the existing record, if you just created it it'll create it.

```js
(async () => {
  
  // Batch create
  let wizards = await Wizard.create([
    { name: 'Saruman' },
    { name: 'Radagast' }
  ]);
  
  // Find some wizards
  let matches = await Wizard.find({ name: 'Radagast' });

  // Update the age of any wizards with an 'a' in their name
  await Wizard.update({ name: /a/ }, { age: 2019 });

  // Delete wizards younger than 1000
  await Wizard.destroy({ age: { '<': 1000 } });
  
})();
```

Along with the instance methods, Otter also provides static methods for easier access. For instance, you can use the method `Wizard.create()` to batch create one or more records at once.

We can query for records using `Wizard.find(...)`, here we pass an query which finds any wizards which have the name `Radagast`. You can do a lot with queries and they get used in the other the static methods, for more info see [Query Syntax](#query-syntax).

You can use `Wizard.update()` to perform batch updates on your records. It takes a query too, updating any records that match it with the values in the second parameter. Here, it sets a wizard's age to 2019 if its name contains an `a`.

Finally we use the `destroy()` method, this one will delete any records which match a given query. Here we delete all wizards which are younger that 1000. Be careful with this one!

### Relations

You also use attributes to define the relations between records.

```js
class Orc extends Otter.Types.Model {
  static attributes() {
    return {
      name: String,
      master: { hasOne: 'Villain' },
      weapon: { type: 'HasOne', model: 'Weapon' }
    };
  }
}

class Villain extends Otter.Types.Model {
  static attributes() {
    return {
      name: String,
      horde: { hasMany: 'Orc via master' }
    };
  }
}

class Weapon extends Otter.Types.Model {
  static attributes() {
    return {
      owners: {
        type: 'HasMany',
        model: 'Orc',
        via: 'weapon'
      }
    };
  }
}
```

Relations are defined just like Attributes and they have their own shorthand too. You can define them like `Orc.master` and `Villain.horde` which defines a one-to-many and many-to-one between `Orc`
 and `Villain`. `Orc.master` defines a pointer on Orcs that points to the Villain that owns them then `Villain.horde` provides accessors on Villains to easily access, add and remove Orcs from the relation.

There is also the full definition, like `Orc.weapon` and `Weapon.owners` which take the `type`, `model` and the `via`, this is what the previous shorthand gets compiled to. Otter requires you specify the `via` attribute so it always know how you want your models to relate.

## ...






## Features in Depth
Here some more info in detail about different features


### Available Attributes
...


### Attribute Options
...


### More About Plugins
...


### Otter Errors
...


### Query Syntax
...


### The Startup Process
...


### Multiple Adapters
...


### Unit Testing
...


### Expression In Detail

#### Definitions

| Name               | Expression |
| ------------------ | ---------- |
| AttrFilter         | `{ AttrName: QueryExpr, ... }`
| QueryExpr          | `ComparisonExpr` , `IncludesExpr` , `InequalityExpr` , `LogicalExpr` , `InList` , `RegexExpr` , `EqualityExpr` |
| ValueType          | `object` , `string` , `number` , `boolean` , `Date` ~ where it matches the attribute type |
| ComparisonOperator | `>` , `>=` , `<=` , `<` |
| LogicalOperator    | `or` , `and` |

```
HasExpr        ::= AttrFilter     ~ where attr is AssociativeType.one
IncludesExpr   ::= AttrFilter     ~ where attr is AssociativeType.many

InequalityExpr ::= { '!': ValueType }
ComparisonExpr ::= { ComparisonOperator: ValueType }
LogicalExpr    ::= { LogicalOperator: AttrFilter[] }

InList         ::= ValueType[]
RegexExpr      ::= RegExp           ~ where attr.valueType is string
EqualityExpr   ::= ValueType
```

#### Precedence

Expressions have a precedence to which order that are executed in, defined below

* (2x) Attribute Specific
  * 21: `HasExpr`
  * 20: `IncludesExpr`
* (1x) Key Specific
  * 12: `InequalityExpr`
  * 11: `ComparisonExpr`
  * 10: `LogicalExpr`
* (0x) Type Specific
  * 2: `InList`
  * 1: `RegexExpr`
  * 0: `EqualityExpr`
