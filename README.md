# Components.js

_A semantic dependency injection framework_

[![Build status](https://github.com/LinkedSoftwareDependencies/Components.js/workflows/CI/badge.svg)](https://github.com/LinkedSoftwareDependencies/Components.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/LinkedSoftwareDependencies/Components.js/badge.svg)](https://coveralls.io/github/LinkedSoftwareDependencies/Components.js)
[![npm version](https://badge.fury.io/js/componentsjs.svg)](https://www.npmjs.com/package/componentsjs)
[![DOI](https://zenodo.org/badge/90724301.svg)](https://zenodo.org/badge/latestdoi/90724301)

This repository contains the source code of Components.js.
Full documentation on its usage can be found at http://componentsjs.readthedocs.io/.

Interested in contributing to this project?
Have a look at this [contribution guide](https://github.com/LinkedSoftwareDependencies/Components.js/blob/master/.github/CONTRIBUTING.md).

## Introduction

Components.js is a [dependency injection] framework for _TypeScript_ and _JavaScript_ projects using JSON(-LD) files.

Instead of hard-wiring software components together, Components.js allows these components to be _instantiated_ and _wired together_ declaratively using _semantic configuration files_.
The advantage of these semantic configuration files is that software components can be uniquely and globally identified using [URIs].

Configurations can be written in any [RDF] serialization, such as [JSON-LD].

This software is aimed for developers who want to build _modular_ and _easily configurable_ and _rewireable_ JavaScript applications.

Get started with the TypeScript or JavaScript quick start guide below!

## Quick Start (TypeScript)

#### 1. Install dependencies

Components.js can be installed using npm:
```bash
$ npm install componentsjs
```

Component and module files can be _automatically_ generated using [Components-Generator.js](https://github.com/LinkedSoftwareDependencies/Components-Generator.js):
```bash
$ npm install -D componentsjs-generator
```

#### 2. Mark your package as a Components.js module

`package.json`:
```json
{
  "name": "my-package",
  "version": "2.3.4",
  "lsd:module": true,
  ...
  "scripts": {
    ...
    "build": "npm run build:ts && npm run build:components",
    "build:ts": "tsc",
    "build:components": "componentsjs-generator",
    "prepare": "npm run build",
    ...
  }
}
```

`"lsd:module"` will allow Components.js to find your module(s) when they are included from other packages.

The `"scripts"` entry will make sure that all required component files will be generated when building your package.

#### 3. Create a configuration file to instantiate our class

Assuming a TypeScript class that is exported from the package:
```typescript
export class MyClass {
  public readonly name: string;
  constructor(name: string) {
    this.name = name;  
  }
}
```

`config.jsonld`:
```json
{
  "@context": [
    "https://linkedsoftwaredependencies.org/bundles/npm/componentsjs/^5.0.0/components/context.jsonld",
    "https://linkedsoftwaredependencies.org/bundles/npm/my-package/^2.0.0/components/context.jsonld"
  ],
  "@id": "urn:my-package:myInstance",
  "@type": "MyClass",
  "name": "John"
}
```

This configuration is a semantic representation of the instantiation of `MyClass` with `name` set to `"John"`.

#### 4. Instantiate from config file

```javascript
...
import { ComponentsManager } from 'componentsjs';

const manager = await ComponentsManager.build({
  mainModulePath: __dirname, // Path to your npm package's root
});
await manager.configRegistry.register('config.jsonld');
const myInstance = await manager.instantiate('urn:my-package:myInstance');
...
```

`myInstance` is an instance of type `MyClass`, as defined in the config file.

## Quick Start (JavaScript)

#### 1. Install dependencies

Components.js can be installed using npm:
```bash
$ npm install componentsjs
```

#### 2. Define your module and its components

Assuming a JavaScript class that is exported from the package:
```typescript
export class MyClass {
  public readonly name;
  constructor(name) {
    this.name = name;  
  }
}
```

`module.jsonld`:
```json
{
  "@context": [
    "https://linkedsoftwaredependencies.org/bundles/npm/componentsjs/^5.0.0/components/context.jsonld",
    { "ex": "http://example.org/" }
  ],
  "@id": "ex:MyPackage",
  "@type": "Module",
  "requireName": "my-package",
  "components": [
    {
      "@id": "ex:MyPackage/MyClass",
      "@type": "Class",
      "requireElement": "MyClass",
      "parameters": [
        { "@id": "ex:MyPackage/MyClass#name", "unique": true }
      ],
      "constructorArguments": [
        { "@id": "ex:MyPackage/MyClass#name" }
      ]
    }
  ]
}
```

The npm module `my-package` exports a class with the name `MyClass`.

The constructor of `MyClass` takes a single `name` argument.

#### 3. Create a configuration file to instantiate our class

`config.jsonld`:
```json
{
  "@context": [
    "https://linkedsoftwaredependencies.org/bundles/npm/componentsjs/^5.0.0/components/context.jsonld",
    {
      "ex": "http://example.org/",
      "name": "ex:MyPackage/MyClass#name"
    }
  ],
  "@id": "http://example.org/myInstance",
  "@type": "ex:MyPackage/MyClass",
  "name": "John"
}
```

This configuration is a semantic representation of the instantiation of `MyClass` with `name` set to `"John"`.

#### 4. Instantiate from config file

```javascript
...
import { ComponentsManager } from 'componentsjs';

const manager = await ComponentsManager.build({
  mainModulePath: __dirname, // Path to your npm package's root
});
await manager.configRegistry.register('config.jsonld');
const myInstance = await manager.instantiate('http://example.org/myInstance');
...
```

`myInstance` is an instance of type `MyClass`, as defined in the config file.

[Components.js]: https://github.com/LinkedSoftwareDependencies/Components.js
[GitHub]: https://github.com/LinkedSoftwareDependencies/Documentation-Components.js
[dependency injection]: https://martinfowler.com/articles/injection.html
[Node.js]: https://nodejs.org/en/
[URIs]: https://www.w3.org/wiki/URI
[RDF]: https://www.w3.org/RDF/
[JSON-LD]: https://json-ld.org/

## Advanced usage

The `ComponentsManager` can be customized with the following options:

```javascript
const manager = await ComponentsManager.build({
    // Absolute path to the package root from which module resolution should start.
    mainModulePath: __dirname,
    // Callback for registering components and modules
    // Defaults to an invocation of {@link ComponentRegistry.registerAvailableModules}.
    moduleLoader: (registry) => {},
    // Callback for registering configurations.
    // Defaults to no config registrations.
    configLoader: (registry) => {},
    // A strategy for constructing instances.
    // Defaults to {@link ConstructionStrategyCommonJs}.
    constructionStrategy: new ConstructionStrategyCommonJs(),
    // If the error state should be dumped into `componentsjs-error-state.json` after failed instantiations.
    // Defaults to `true`.
    dumpErrorState: true,
    // The logging level.
    // Defaults to `'warn'`.
    logLevel: 'warn',
    // The module state.
    // Defaults to a newly created instance on the {@link mainModulePath}.
    moduleState: {},
    // If JSON-LD context validation should be skipped.
    // Defaults to `true`.
    skipContextValidation: true,
    // If values for parameters should be type-checked.
    // Defaults to `true`.
    typeChecking: true,
});
```

## Cite

If you are using or extending Components.js as part of a scientific publication,
we would appreciate a citation of our [article](https://linkedsoftwaredependencies.github.io/Article-System-Components/).

```bibtex
@article{taelman_swj_componentsjs_2022,
  author = {Taelman, Ruben and Van Herwegen, Joachim and Vander Sande, Miel and Verborgh, Ruben},
  title = {Components.js: Semantic Dependency Injection},
  journal = {Semantic Web Journal},
  year = {2022},
  month = jan,
  url = {https://linkedsoftwaredependencies.github.io/Article-System-Components/}
}
```

## License
Components.js is written by [Ruben Taelman](http://www.rubensworks.net/).

This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/)
and released under the [MIT license](http://opensource.org/licenses/MIT).
