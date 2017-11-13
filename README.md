# Otter ORM

A modern extendable ORM for javascript

## A Simple Example

```js
const Otter = require('otterjs');

class Wizard extends Otter.Types.Model {
  static attributes() {
    return {
      name: String,
      age: Number,
      companions: { hasMany: 'Hero via wizard' }
    };
  }
}
class Hero extends Otter.Types.Model {
  static attributes() {
    return {
      name: { type: String, default: 'John' },
      weapon: { type: String, enum: [ 'Sword', 'Bow', 'Axe', 'Hammer' ] },
      wizard: { hasOne: 'Wizard' }
    };
  }
}

(async () => {
  
  // Connect to a Mongo database
  Otter.use(Otter.Plugins.MongoConnection, {
    url: 'mongodb://root:secret@localhost:27017/otter'
  });
  
  // Add our models
  Otter.addModel(Wizard);
  Otter.addModel(Hero);
  
  // Startup Otter, validating its configuration
  // Checks the connection and validates the configuration
  await Otter.start();
  
  // Create a new wizard
  let gandalf = await Wizard.create({
    name: 'Gandalf',
    age: 2019
  });
  
  // Create some heroes
  await Hero.create([
    { name: 'Aragorn', weapon: 'Sword', wizard: gandalf.id },
    { name: 'Legolas', weapon: 'Bow', wizard: gandalf.id },
    { name: 'Gimli', weapon: 'Axe', wizard: gandalf.id }
  ]);
  
  // Get Gandalf's heroes which have an 'o' in their name
  let heroes = await gandalf.companions().where('name', /o/ig);
})()
```



## Using Models

Models are your connection to the database, they are ES6 Classes which subclass `Otter.Types.Model` and are registered by calling `Otter.addModel(MyModel)`.

### Attributes

Models define attributes which are the fields you want to store in the database. This is done by defining the static `attributes()` method on your subclass, which should return an object of the attributes you want your model to have.

```js
class Wizard extends Otter.Types.Model {
  
  static attributes() {
    return {
      name: String,
      height: 'Number',
      age: {
        type: Number,
        default: 42
      },
      weapon: {
        type: String,
        enum: [ 'Staff', 'Wand', 'CrystalBall' ]
      }
    }
  }
}
```

Attributes can be defined in a couple of ways, you can use the shorthand by referencing a native type or the name type of Attribute, like `name` or `height`. For the Attributes you can use see [Available Attributes](#attr-types)

You can also provide a full definition like `age` or `weapon`, here you pass the type (which accepts the same values as the shorthand) along with other options. For the available options and more info see [Attribute Options](#attr-opts)

### Accessor Methods

Once you have a Model, you can start using it. First you'll have to let Otter know about your Model and get Otter started up. Starting is asynchronous, so we'll need run this in an async block. [More info about async-await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

```js
(async () => {
  
  // Register our Model
  Otter.addModel(Wizard);
  
  // Tell Otter what database to connect to
  Otter.use(Otter.Plugins.MongoConnection, { url: 'mongodb://...' });
  
  // Startup Otter, configuration errors are thrown here
  await Otter.start();
  
  
  
  // Create a wizard
  let gandalf = new Wizard({ name: 'Gandalf', age: 2018 });
  
  // Set his age
  gandalf.age = 2019
  
  // Save him into the database
  await gandalf.save()
  
  // Batch create
  await Wizard.create([ { name: 'Saruman' }, { name: 'Radagast' } ])
  
  
  
  // Find some wizards
  let matches = await Wizard.find({ name: 'Radagast' })
  
  // Update the age of any wizards with an 'a' in their name
  await Wizard.update({ name: /a/ }, { age: 2019 })
  
  // Delete wizards younger than 1000
  await Wizard.destroy({ age: { '<': 1000 } })
  
})();
```

There are a few things here, firstly we're registering our Model, adding a connection to a mongo database and then starting Otter up.

We simply register our model with the `Otter.addModel()` to Otter, this lets Otter know we want to use this model. Otter won't do anything with our model, yet, but its ready for when we start up.

Next we use a Plugin to register our connection to our mongo database (you'll of course need to set your [Mongo URI](https://docs.mongodb.com/manual/reference/connection-string/)). The plugin system lets package authors define units of code that can be added to Otter in one go, for more info see [More About Plugins](#plugins).

The final step is to start up Otter, this lets otter perform all the checks it needs and get your Model ready for use. Otter checks your Model's configuration and that you've defined all of your attributes correctly. This step will throw errors about any incorrect configuration (or the promise will reject if not using async-await). For all of the errors that can be thrown see [Otter Errors](#errors).

Now we can do the interesting stuff, we create our first wizard, Gandalf of course. You can use your model just like any ES6 class and call `save()` to save the wizard into the database. You can also use the static method `Wizard.create()` to batch create one or more records at once.

We can query for records using the `Wizard.find(...)` static method, here we pass an object query into `find()` which finds any wizards which have the name `Radagast`. You can do a lot with queries and they get used in the other the accessor methods, for more info see [Query Syntax](#query-syntax).

Finally we use the other accessor methods, `update()` and `destroy()`, which take the same queries like `find()`. `update()` takes a query and updates all records that match with a set of values. `destroy()` deletes all records that match a query, be careful!

### Relations

You also use attributes to define the relations between records.

```js
class Orc extends Otter.Types.Model {
  static attributes() {
    return {
      name: String,
      master: { hasOne: 'Villain' },
      weapon: { type: 'HasOne', model: 'Weapon' }
    }
  }
}

class Villain extends Otter.Types.Model {
  static attributes() {
    return {
      name: String,
      horde: { hasMany: 'Orc via master' }
    }
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
    }
  }
}
```

Relations are defined just like Attributes and they have their own shorthand too. You can define them like `Orc.master` and `Villain.horde` which defines a one-to-many and many-to-one between `Orc`
 and `Villain`. `Orc.master` defines a pointer on Orcs that points to the Villain that owns them then `Villain.horde` provides accessors on Villains to easily access, add and remove Orcs from the relation.

There is also the full definition, like `Orc.weapon` and `Weapon.owners` which take the `type`, `model` and the `via`, this is what the previous shorthand gets compiled to. Otter requires you specify the `via` attribute so it always know how you want your models to relate.

## ...






## Features in Depth
Here some more info in detail about different features


### Available Attributes <a name="attr-types"></a>
...


### Attribute Options <a name="attr-opts"></a>
...


### More About Plugins <a name="plugins"></a>
...


### Otter Errors <a name="errors"></a>
...


### Query Syntax <a name="query-syntax"></a>
...


### The Startup Process <a name="startup-process"></a>
...


### Multiple Adapters <a name="multi-adapters"></a>
...


### Unit Testing <a name="unit-testing"></a>
...
