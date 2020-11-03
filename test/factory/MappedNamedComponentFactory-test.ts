import { Resource, RdfObjectLoader } from 'rdf-object';
import Util = require('../../lib/Util');
import { MappedNamedComponentFactory } from '../../lib/factory/MappedNamedComponentFactory';
import { Loader } from '../../lib/Loader';

// TODO: improve these imports
const N3 = require('n3');
const Hello = require("../../__mocks__/helloworld").Hello;

describe('MappedNamedComponentFactory', function () {
  let loader: Loader;
  let objectLoader: RdfObjectLoader;

  beforeEach(() => {
    loader = new Loader();
    // Create resources via object loader, so we can use CURIEs
    objectLoader = loader.objectLoader;
  });

  describe('for an N3 Lexer', function () {
    let n3LexerComponent: Resource;
    let module: Resource;
    beforeEach(function () {
      n3LexerComponent = objectLoader.createCompactedResource({
        '@id': 'http://example.org/n3#Lexer',
        requireElement: objectLoader.createCompactedResource('"Lexer"'),
        types: [ objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'Class') ],
        parameters: [
          objectLoader.createCompactedResource({ '@id': 'http://example.org/n3#lineMode', unique: '"true"' }),
          objectLoader.createCompactedResource({ '@id': 'http://example.org/n3#comments', unique: '"true"' }),
          objectLoader.createCompactedResource({ '@id': 'http://example.org/n3#n3', unique: '"true"' })
        ],
        constructorArguments: objectLoader.createCompactedResource({
          list: [
            objectLoader.createCompactedResource({
              fields: [
                { key: objectLoader.createCompactedResource('"lineMode"'), value: objectLoader.createCompactedResource('http://example.org/n3#lineMode') },
                { key: objectLoader.createCompactedResource('"n3"'), value: objectLoader.createCompactedResource('http://example.org/n3#n3') },
                { key: objectLoader.createCompactedResource('"comments"'), value: objectLoader.createCompactedResource('http://example.org/n3#comments') }
              ]
            })
          ]
        })
      });
      module = objectLoader.createCompactedResource({
        '@id': 'http://example.org/n3',
        requireName: '"n3"',
        components: [
          n3LexerComponent,
        ]
      });
    });

    describe('for a constructor', function () {
      let constructor: MappedNamedComponentFactory;
      beforeEach(() => {
        constructor = new MappedNamedComponentFactory(module, n3LexerComponent, objectLoader.createCompactedResource({
          'http://example.org/n3#lineMode': objectLoader.createCompactedResource('"true"'),
          'http://example.org/n3#n3': objectLoader.createCompactedResource('"true"'),
          'http://example.org/n3#comments': objectLoader.createCompactedResource('"true"')
        }), true, {}, loader);
      });

      it('should be valid', function () {
        expect(constructor).toBeTruthy();
      });

      it('should create valid arguments', async () => {
        const args = await constructor.makeArguments();
        expect(args).toEqual([{comments: 'true', lineMode: 'true', n3: 'true'}]);
      });

      it('should make a valid instance', async () => {
        const instance = await constructor.create();
        expect(instance).toBeTruthy();
        expect(instance).toBeInstanceOf(N3.Lexer);
      });
    });

    describe('#makeUnnamedDefinitionConstructor', function () {
      it('should create a valid definition constructor', function () {
        let constructor = MappedNamedComponentFactory.makeUnnamedDefinitionConstructor(module, n3LexerComponent, objectLoader);
        expect(constructor).toBeTruthy();
        expect(constructor).toBeInstanceOf(Function);
        expect(constructor(objectLoader.createCompactedResource({}))).toBeInstanceOf(Resource);
      });

      it('should create a resource with undefined arguments when constructed with no arguments', function () {
        let instance: any = MappedNamedComponentFactory.makeUnnamedDefinitionConstructor(module, n3LexerComponent, objectLoader)(objectLoader.createCompactedResource({}));
        expect(instance).toBeInstanceOf(Resource);
        expect(instance).toHaveProperty('type', 'BlankNode');
        expect(instance.property).toHaveProperty('requireName', objectLoader.createCompactedResource('"n3"'));
        expect(instance.property).toHaveProperty('requireElement', objectLoader.createCompactedResource('"Lexer"'));
        expect(instance.property).toHaveProperty('arguments');
        expect(instance.property.arguments.list.length).toEqual(1);
        expect(instance.property.arguments.list[0].properties.fields.length).toEqual(3);
        expect(instance.property.arguments.list[0].properties.fields[0].property.key.value).toEqual('lineMode');
        expect(instance.property.arguments.list[0].properties.fields[0].property.value).toBeUndefined();
        expect(instance.property.arguments.list[0].properties.fields[1].property.key.value).toEqual('n3');
        expect(instance.property.arguments.list[0].properties.fields[1].property.value).toBeUndefined();
        expect(instance.property.arguments.list[0].properties.fields[2].property.key.value).toEqual('comments');
        expect(instance.property.arguments.list[0].properties.fields[2].property.value).toBeUndefined();
      });

      it('should create a resource with defined arguments when constructed with arguments', function () {
        let instance: any = MappedNamedComponentFactory.makeUnnamedDefinitionConstructor(module, n3LexerComponent, objectLoader)(objectLoader.createCompactedResource({
          'http://example.org/n3#lineMode': objectLoader.createCompactedResource('"true"'),
          'http://example.org/n3#n3': objectLoader.createCompactedResource('"true"'),
          'http://example.org/n3#comments': objectLoader.createCompactedResource('"true"')
        }));
        expect(instance).toBeInstanceOf(Resource);
        expect(instance).toHaveProperty('type', 'BlankNode');
        expect(instance.property).toHaveProperty('requireName', objectLoader.createCompactedResource('"n3"'));
        expect(instance.property).toHaveProperty('requireElement', objectLoader.createCompactedResource('"Lexer"'));
        expect(instance.property).toHaveProperty('arguments');
        expect(instance.property.arguments.list.length).toEqual(1);
        expect(instance.property.arguments.list[0].properties.fields.length).toEqual(3);
        expect(instance.property.arguments.list[0].properties.fields[0].property.key.value).toEqual('lineMode');
        expect(instance.property.arguments.list[0].properties.fields[0].property.value.value).toEqual('true');
        expect(instance.property.arguments.list[0].properties.fields[1].property.key.value).toEqual('n3');
        expect(instance.property.arguments.list[0].properties.fields[1].property.value.value).toEqual('true');
        expect(instance.property.arguments.list[0].properties.fields[2].property.key.value).toEqual('comments');
        expect(instance.property.arguments.list[0].properties.fields[2].property.value.value).toEqual('true');
      });
    });
  });

  describe('for an N3 Parser', function () {
    let n3LexerComponent: Resource;
    let n3ParserComponent: Resource;
    let module: Resource;
    let constructor: MappedNamedComponentFactory;
    beforeEach(function () {
      n3LexerComponent = objectLoader.createCompactedResource({
        '@id': 'http://example.org/n3#Lexer',
        requireElement: objectLoader.createCompactedResource('"Lexer"'),
        types: [ objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'Class') ],
        parameters: [
          objectLoader.createCompactedResource({ '@id': 'http://example.org/n3#lineMode', unique: '"true"' }),
          objectLoader.createCompactedResource({ '@id': 'http://example.org/n3#n3', unique: '"true"' }),
          objectLoader.createCompactedResource({ '@id': 'http://example.org/n3#comments', unique: '"true"' })
        ],
        constructorArguments: objectLoader.createCompactedResource({
          list: [
            objectLoader.createCompactedResource({
              fields: [
                { key: objectLoader.createCompactedResource('"lineMode"'), value: objectLoader.createCompactedResource('http://example.org/n3#lineMode') },
                { key: objectLoader.createCompactedResource('"n3"'), value: objectLoader.createCompactedResource('http://example.org/n3#n3') },
                { key: objectLoader.createCompactedResource('"comments"'), value: objectLoader.createCompactedResource('http://example.org/n3#comments') }
              ]
            })
          ]
        })
      });
      n3ParserComponent = objectLoader.createCompactedResource({
        '@id': 'http://example.org/n3#Parser',
        requireElement: objectLoader.createCompactedResource('"Parser"'),
        types: [ objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'Class') ],
        parameters: [
          objectLoader.createCompactedResource({ '@id': 'http://example.org/n3#format', unique: '"true"' }),
          objectLoader.createCompactedResource({ '@id': 'http://example.org/n3#blankNodePrefix', unique: '"true"' }),
          objectLoader.createCompactedResource({ '@id': 'http://example.org/n3#lexer', unique: '"true"' }),
          objectLoader.createCompactedResource({ '@id': 'http://example.org/n3#explicitQuantifiers', unique: '"true"' })
        ],
        constructorArguments: objectLoader.createCompactedResource({
          list: [
            objectLoader.createCompactedResource({
              fields: [
                { key: objectLoader.createCompactedResource('"format"'), value: objectLoader.createCompactedResource('http://example.org/n3#format') },
                { key: objectLoader.createCompactedResource('"blankNodePrefix"'), value: objectLoader.createCompactedResource('http://example.org/n3#blankNodePrefix') },
                { key: objectLoader.createCompactedResource('"lexer"'), value: objectLoader.createCompactedResource('http://example.org/n3#lexer') },
                { key: objectLoader.createCompactedResource('"explicitQuantifiers"'), value: objectLoader.createCompactedResource('http://example.org/n3#explicitQuantifiers') }
              ]
            })
          ]
        })
      });
      module = objectLoader.createCompactedResource({
        '@id': 'http://example.org/n3',
        requireName: '"n3"',
        components: [
          n3ParserComponent,
        ]
      });
      constructor = new MappedNamedComponentFactory(module, n3ParserComponent, objectLoader.createCompactedResource({
        'http://example.org/n3#format': '"application/trig"',
        'http://example.org/n3#lexer': MappedNamedComponentFactory.makeUnnamedDefinitionConstructor(module, n3LexerComponent, objectLoader)(objectLoader.createCompactedResource({
          'http://example.org/n3#lineMode': objectLoader.createCompactedResource('"true"'),
          'http://example.org/n3#n3': objectLoader.createCompactedResource('"true"'),
          'http://example.org/n3#comments': objectLoader.createCompactedResource('"true"')
        })),
      }), true, {}, loader);
    });

    it('should be valid', function () {
      expect(constructor).toBeTruthy();
    });

    it('should create valid arguments', async() => {
      const args = await constructor.makeArguments();
      expect(args[0].format).toEqual('application/trig');
      expect(args[0].lexer).toBeTruthy();
      expect(args[0].lexer).toBeInstanceOf(N3.Lexer);
    });

    it('should make a valid instance', async() => {
      const instance = await constructor.create();
      expect(instance).toBeTruthy();
      expect(instance).toBeInstanceOf(N3.Parser);
    });
  });

  describe('for an N3 Util', function () {
    let n3UtilComponent: Resource;
    let module: Resource;
    let constructor: MappedNamedComponentFactory;
    beforeEach(function () {
      n3UtilComponent = objectLoader.createCompactedResource({
        '@id': 'http://example.org/n3#Util',
        requireElement: objectLoader.createCompactedResource('"Util"'),
        types: [ objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'ComponentInstance') ],
      });
      module = objectLoader.createCompactedResource({
        '@id': 'http://example.org/n3',
        requireName: '"n3"',
        components: [
          n3UtilComponent,
        ]
      });
      constructor = new MappedNamedComponentFactory(module, n3UtilComponent, objectLoader.createCompactedResource({}), false, {}, loader);
    });

    it('should be valid', function () {
      expect(constructor).toBeTruthy();
    });

    it('should create valid arguments', async() => {
      const args = await constructor.makeArguments();
      expect(args).toEqual([]);
    });

    it('should make a valid instance', async() => {
      const instance = await constructor.create();
      expect(instance).toBeTruthy();
      expect(instance).toBeInstanceOf(Function); // Because N3Util is a function
    });
  });

  describe('for an N3 Dummy', function () {
    let n3DummyComponent: Resource;
    let module: Resource;
    let constructor: MappedNamedComponentFactory;
    beforeEach(function () {
      n3DummyComponent = objectLoader.createCompactedResource({
        '@id': 'http://example.org/n3#Dummy',
        requireElement: objectLoader.createCompactedResource('"Dummy"'),
        types: [ objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'Class') ],
        parameters: [
          objectLoader.createCompactedResource({ '@id': 'http://example.org/n3#dummyParam', unique: '"true"' })
        ],
        constructorArguments: objectLoader.createCompactedResource({
          list: [
            objectLoader.createCompactedResource({
              fields: [
                { key: objectLoader.createCompactedResource('"dummyParam"'), value: objectLoader.createCompactedResource('http://example.org/n3#dummyParam') }
              ]
            })
          ]
        })
      });
      module = objectLoader.createCompactedResource({
        '@id': 'http://example.org/n3',
        requireName: '"n3"',
        components: [
          n3DummyComponent,
        ]
      });
      constructor = new MappedNamedComponentFactory(module, n3DummyComponent, objectLoader.createCompactedResource({
        'http://example.org/n3#dummyParam': objectLoader.createCompactedResource('"true"')
      }), true, {}, loader);
    });

    it('should be valid', function () {
      expect(constructor).toBeTruthy();
    });

    it('should create valid arguments', async() => {
      const args = await constructor.makeArguments();
      expect(args).toEqual([ {
        'dummyParam': 'true',
      } ]);
    });

    it('should fail to make a valid instance', async()  => {
      await expect(constructor.create()).rejects.toThrow(new Error('Failed to get module element Dummy from module n3'));
    });
  });

  describe('for a hello world component', function () {
    let helloWorldComponent1: Resource;
    let helloWorldComponent2: Resource;
    let module: Resource;
    let constructor: MappedNamedComponentFactory;
    beforeEach(function () {
      // Component definition for Hello World
      helloWorldComponent1 = objectLoader.createCompactedResource({
        '@id': 'http://example.org/HelloWorldModule#SayHelloComponent1',
        requireElement: objectLoader.createCompactedResource('"Hello"'),
        types: [ objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'Class') ],
        parameters: [
          objectLoader.createCompactedResource({ '@id': 'http://example.org/HelloWorldModule#dummyParam', unique: '"true"' })
        ],
        constructorArguments: objectLoader.createCompactedResource({
          list: [
            objectLoader.createCompactedResource({
              fields: [
                { key: objectLoader.createCompactedResource('"dummyParam"'), value: objectLoader.createCompactedResource('http://example.org/HelloWorldModule#dummyParam') }
              ]
            })
          ]
        })
      });
      helloWorldComponent2 = objectLoader.createCompactedResource({
        '@id': 'http://example.org/HelloWorldModule#SayHelloComponent2',
        requireElement: objectLoader.createCompactedResource('"Hello"'),
        types: [ objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'Class') ],
        parameters: [
          objectLoader.createCompactedResource({ '@id': 'http://example.org/HelloWorldModule#dummyParam', unique: '"true"' }),
          objectLoader.createCompactedResource({ '@id': 'http://example.org/HelloWorldModule#instanceParam', unique: '"true"' })
        ],
        constructorArguments: objectLoader.createCompactedResource({
          list: [
            objectLoader.createCompactedResource({
              fields: [
                { key: objectLoader.createCompactedResource('"dummyParam"'), value: objectLoader.createCompactedResource('http://example.org/HelloWorldModule#dummyParam') },
                { key: objectLoader.createCompactedResource('"instanceParam"'), value: objectLoader.createCompactedResource('http://example.org/HelloWorldModule#instanceParam') }
              ]
            })
          ]
        })
      });
      module = objectLoader.createCompactedResource({
        '@id': 'http://example.org/helloworld',
        requireName: '"helloworld"',
        components: [
          helloWorldComponent1,
          helloWorldComponent2,
        ]
      });
      constructor = new MappedNamedComponentFactory(module, helloWorldComponent2, objectLoader.createCompactedResource({
        'http://example.org/HelloWorldModule#dummyParam': objectLoader.createCompactedResource('"true"'),
        'http://example.org/HelloWorldModule#instanceParam': MappedNamedComponentFactory
          .makeUnnamedDefinitionConstructor(module, helloWorldComponent1, objectLoader)(objectLoader.createCompactedResource({}))
      }), true, {}, loader);
    });

    it('should be valid', function () {
      expect(constructor).toBeTruthy();
    });

    it('should create valid arguments', async() => {
      const args = await constructor.makeArguments();
      expect(args).toEqual([ {
        'dummyParam': 'true',
        'instanceParam': new Hello()
      } ]);
    });

    it('should make a valid instance', async() => {
      const instance = await constructor.create();
      expect(instance).toBeTruthy();
      expect(instance).toBeInstanceOf(Hello);
    });
  });

  describe('for a hello world component with id param', function () {
    let helloWorldComponent3: Resource;
    let module: Resource;
    let constructor: MappedNamedComponentFactory;
    beforeEach(function () {
      helloWorldComponent3 = objectLoader.createCompactedResource({
        '@id': 'http://example.org/HelloWorldModule#SayHelloComponent3',
        requireElement: '"Hello"',
        types: [ objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'Class') ],
        parameters: [
          objectLoader.createCompactedResource({ '@id': 'http://example.org/HelloWorldModule#dummyParam', unique: '"true"' }),
          objectLoader.createCompactedResource({ '@id': 'http://example.org/HelloWorldModule#instanceParam', unique: '"true"' }),
        ],
        constructorArguments: objectLoader.createCompactedResource({
          list: [
            objectLoader.createCompactedResource({
              fields: [
                { key: objectLoader.createCompactedResource('"dummyParam"'), value: objectLoader.createCompactedResource('http://example.org/HelloWorldModule#dummyParam') },
                { key: objectLoader.createCompactedResource('"instanceParam"'), value: objectLoader.createCompactedResource('http://example.org/HelloWorldModule#instanceParam') },
                { key: objectLoader.createCompactedResource('"idParam"'), value: objectLoader.createCompactedResource(Util.PREFIXES['rdf'] + 'subject') }
              ]
            })
          ]
        })
      });
      module = objectLoader.createCompactedResource({
        '@id': 'http://example.org/helloworld',
        requireName: '"helloworld"',
        components: [
          helloWorldComponent3,
        ]
      });
      constructor = new MappedNamedComponentFactory(module, helloWorldComponent3, objectLoader.createCompactedResource({
        '@id': 'http://example.org/myHelloComponent'
      }), true, {}, loader);
    });

    it('should be valid', function () {
      expect(constructor).toBeTruthy();
    });

    it('should create valid arguments', async() => {
      const args = await constructor.makeArguments();
      expect(args).toEqual([ {
        'idParam': 'http://example.org/myHelloComponent'
      } ]);
    });

    it('should make a valid instance', async() => {
      const instance = await constructor.create();
      expect(instance).toBeTruthy();
      expect(instance).toBeInstanceOf(Hello);
    });
  });

  describe('for a hello world component with array params', function () {
    let helloWorldComponent4: Resource;
    let module: Resource;
    let constructor: MappedNamedComponentFactory;
    beforeEach(function () {
      helloWorldComponent4 = objectLoader.createCompactedResource({
        '@id': 'http://example.org/HelloWorldModule#SayHelloComponent3',
        requireElement: '"Hello"',
        types: [ objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'Class') ],
        parameters: [
          objectLoader.createCompactedResource({ '@id': 'http://example.org/HelloWorldModule#dummyParam' }),
          objectLoader.createCompactedResource({ '@id': 'http://example.org/HelloWorldModule#instanceParam' }),
          objectLoader.createCompactedResource({ '@id': 'http://example.org/HelloWorldModule#idParam' })
        ],
        constructorArguments: objectLoader.createCompactedResource({
          list: [
            objectLoader.createCompactedResource({
              elements: {
                list: [
                  objectLoader.createCompactedResource('http://example.org/HelloWorldModule#dummyParam'),
                  objectLoader.createCompactedResource('http://example.org/HelloWorldModule#instanceParam')
                ]
              }
            })
          ]
        })
      });
      module = objectLoader.createCompactedResource({
        '@id': 'http://example.org/helloworld',
        requireName: '"helloworld"',
        components: [
          helloWorldComponent4,
        ]
      });
      constructor = new MappedNamedComponentFactory(module, helloWorldComponent4, objectLoader.createCompactedResource({
        'http://example.org/HelloWorldModule#dummyParam': objectLoader.createCompactedResource('"true"'),
        'http://example.org/HelloWorldModule#instanceParam': objectLoader.createCompactedResource('"false"'),
      }), true, {}, loader);
    });

    it('should be valid', function () {
      expect(constructor).toBeTruthy();
    });

    it('should create valid arguments', async() => {
      const args = await constructor.makeArguments();
      expect(args).toEqual([[
        'true', 'false'
      ]]);
    });

    it('should make a valid instance', async() => {
      const instance = await constructor.create();
      expect(instance).toBeTruthy();
      expect(instance).toBeInstanceOf(Hello);
    });
  });

  describe('for a hello world component with default values', function () {
    let helloWorldComponent5: Resource;
    let module: Resource;
    let constructor: MappedNamedComponentFactory;
    beforeEach(function () {
      let defaultedParam1 = objectLoader.createCompactedResource({
        '@id': 'http://example.org/n3#dummyParam1',
        default: [
          '"a"',
          '"b"'
        ]
      });
      let defaultedParam2 = objectLoader.createCompactedResource({
        '@id': 'http://example.org/n3#dummyParam2',
        unique: true,
        default: [
          '"a"'
        ]
      });
      helloWorldComponent5 = objectLoader.createCompactedResource({
        '@id': 'http://example.org/HelloWorldModule#SayHelloComponent4',
        requireElement: '"Hello"',
        types: [ objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'Class') ],
        parameters: [ defaultedParam1, defaultedParam2, ],
        constructorArguments: objectLoader.createCompactedResource({
          list: [
            objectLoader.createCompactedResource({
              fields: [
                { key: objectLoader.createCompactedResource('"dummyParam1"'), value: defaultedParam1 },
                { key: objectLoader.createCompactedResource('"dummyParam2"'), value: defaultedParam2 }
              ]
            })
          ]
        })
      });
      module = objectLoader.createCompactedResource({
        '@id': 'http://example.org/helloworld',
        requireName: '"helloworld"',
        components: [
          helloWorldComponent5,
        ]
      });
    });

    describe('without overridden default values', function () {
      beforeEach(() => {
        constructor = new MappedNamedComponentFactory(module, helloWorldComponent5, objectLoader.createCompactedResource({}), true, {}, loader);
      });

      it('should be valid', function () {
        expect(constructor).toBeTruthy();
      });

      it('should create valid arguments', async () => {
        const args = await constructor.makeArguments();
        expect(args).toEqual([{
          'dummyParam1': ['a', 'b'],
          'dummyParam2': [ 'a' ],
        }]);
      });

      it('should make a valid instance', async () => {
        const instance = await constructor.create();
        expect(instance).toBeTruthy();
        expect(instance).toBeInstanceOf(Hello);
      });
    });

    describe('with overridden default values', function () {
      beforeEach(() => {
        constructor = new MappedNamedComponentFactory(module, helloWorldComponent5, objectLoader.createCompactedResource({
          'http://example.org/n3#dummyParam1': objectLoader.createCompactedResource('"true"'),
          'http://example.org/n3#dummyParam2': objectLoader.createCompactedResource('"false"')
        }), true, {}, loader);
      });

      it('should be valid', function () {
        expect(constructor).toBeTruthy();
      });

      it('should create valid arguments', async() => {
        const args = await constructor.makeArguments();
        expect(args).toEqual([{
          'dummyParam1': [ 'true' ],
          'dummyParam2': [ 'false' ],
        }]);
      });

      it('should make a valid instance', async() => {
        const instance = await constructor.create();
        expect(instance).toBeTruthy();
        expect(instance).toBeInstanceOf(Hello);
      });
    });
  });

  describe('for a hello world component with default scoped values', function () {
    let helloWorldComponent6: Resource;
    let module: Resource;
    let constructor: MappedNamedComponentFactory;
    beforeEach(function () {
      let defaultScopedParam1 = objectLoader.createCompactedResource({
        '@id': 'http://example.org/n3#dummyParam1',
        defaultScoped: [
          {
            defaultScope: [],
            defaultScopedValue: [
              '"a"',
              '"b"'
            ]
          }
        ]
      });
      let defaultScopedParam2 = objectLoader.createCompactedResource({
        '@id': 'http://example.org/n3#dummyParam2',
        unique: true,
        defaultScoped: [
          {
            defaultScope: [],
            defaultScopedValue: [
              '"a"',
            ]
          }
        ]
      });
      helloWorldComponent6 = objectLoader.createCompactedResource({
        '@id': 'http://example.org/HelloWorldModule#SayHelloComponent5',
        requireElement: '"Hello"',
        types: [ objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'Class') ],
        parameters: [ defaultScopedParam1, defaultScopedParam2, ],
        constructorArguments: objectLoader.createCompactedResource({
          list: [
            objectLoader.createCompactedResource({
              fields: [
                { key: objectLoader.createCompactedResource('"dummyParam1"'), value: defaultScopedParam1 },
                { key: objectLoader.createCompactedResource('"dummyParam2"'), value: defaultScopedParam2 }
              ]
            })
          ]
        })
      });
      helloWorldComponent6.properties.parameters.forEach((param: Resource) => param.properties.defaultScoped[0].properties.defaultScope.push(helloWorldComponent6));
      module = objectLoader.createCompactedResource({
        '@id': 'http://example.org/helloworld',
        requireName: '"helloworld"',
        components: [
          helloWorldComponent6,
        ]
      });
    });

    describe('without overridden default scoped values', () => {
      beforeEach(() => {
        constructor = new MappedNamedComponentFactory(module, helloWorldComponent6, objectLoader.createCompactedResource({ types: [ helloWorldComponent6 ] }), true, {}, loader);
      });

      it('should be valid', function () {
        expect(constructor).toBeTruthy();
      });

      it('should create valid arguments', async() => {
        const args = await constructor.makeArguments();
        expect(args).toEqual([{
          'dummyParam1': [ 'a', 'b' ],
          'dummyParam2': [ 'a' ],
        }]);
      });

      it('should make a valid instance', async() => {
        const instance = await constructor.create();
        expect(instance).toBeTruthy();
        expect(instance).toBeInstanceOf(Hello);
      });
    });

    describe('with overridden default scoped values', () => {
      beforeEach(() => {
        constructor = new MappedNamedComponentFactory(module, helloWorldComponent6, objectLoader.createCompactedResource({
          'http://example.org/n3#dummyParam1': objectLoader.createCompactedResource('"true"'),
          'http://example.org/n3#dummyParam2': objectLoader.createCompactedResource('"false"')
        }), true, {}, loader);
      });

      it('should be valid', function () {
        expect(constructor).toBeTruthy();
      });

      it('should create valid arguments', async() => {
        const args = await constructor.makeArguments();
        expect(args).toEqual([{
          'dummyParam1': [ 'true' ],
          'dummyParam2': [ 'false' ],
        }]);
      });

      it('should make a valid instance', async() => {
        const instance = await constructor.create();
        expect(instance).toBeTruthy();
        expect(instance).toBeInstanceOf(Hello);
      });
    });

    describe('with non-applicable default scoped values', () => {
      beforeEach(() => {
        constructor = new MappedNamedComponentFactory(module, helloWorldComponent6, objectLoader.createCompactedResource({ types: [ 'http://example.org/HelloWorldModule#SayHelloComponent5' ] }), true, {}, loader);
      });

      it('should be valid', function () {
        expect(constructor).toBeTruthy();
      });

      it('should create valid arguments', async() => {
        const args = await constructor.makeArguments();
        expect(args).toEqual([{
          'dummyParam1': [ 'a', 'b' ],
          'dummyParam2': [ 'a' ],
        }]);
      });

      it('should make a valid instance', async() => {
        const instance = await constructor.create();
        expect(instance).toBeTruthy();
        expect(instance).toBeInstanceOf(Hello);
      });
    });
  });

    describe('for a hello world component with a missing required parameter', function () {
      let helloWorldComponent7: Resource;
      let module: Resource;
        let constructor: MappedNamedComponentFactory;
        beforeEach(function () {
          helloWorldComponent7 = objectLoader.createCompactedResource({
            '@id': 'http://example.org/HelloWorldModule#SayHelloComponent6',
            requireElement: '"Hello"',
            types: [objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'Class')],
            parameters: [
              objectLoader.createCompactedResource({
                '@id': 'http://example.org/HelloWorldModule#requiredParam',
                required: true,
              })
            ],
            constructorArguments: objectLoader.createCompactedResource({
              list: [
                objectLoader.createCompactedResource({
                  elements: {
                    list: [
                      objectLoader.createCompactedResource('http://example.org/HelloWorldModule#requiredParam')
                    ]
                  }
                })
              ]
            })
          });
          module = objectLoader.createCompactedResource({
            '@id': 'http://example.org/helloworld',
            requireName: '"helloworld"',
            components: [
              helloWorldComponent7,
            ]
          });
        });

      describe('without a valid required parameter', () => {
        it('should fail on construction', function () {
          expect(() => new MappedNamedComponentFactory(module, helloWorldComponent7, objectLoader.createCompactedResource({}), true, {}, loader)).toThrow();
        });
      });

      describe('with a valid required parameter', () => {
        beforeEach(function () {
          constructor = new MappedNamedComponentFactory(module, helloWorldComponent7, objectLoader.createCompactedResource({
            'http://example.org/HelloWorldModule#requiredParam': objectLoader.createCompactedResource('"true"'),
          }), true, {}, loader);
        });

        it('should be valid', function () {
          expect(constructor).toBeTruthy();
        });

        it('should create valid arguments', async() => {
          const args = await constructor.makeArguments();
          expect(args).toEqual([[
            'true'
          ]]);
        });

        it('should make a valid instance', async() => {
          const instance = await constructor.create();
          expect(instance).toBeTruthy();
          expect(instance).toBeInstanceOf(Hello);
        });
      });
    });

    describe('for a hello world component with lazy parameters', function () {
      let helloWorldComponent8: Resource;
      let module: Resource;
        let constructor: MappedNamedComponentFactory;
        beforeEach(function () {
          helloWorldComponent8 = objectLoader.createCompactedResource({
            '@id': 'http://example.org/HelloWorldModule#SayHelloComponent8',
            requireElement: '"Hello"',
            types: [ objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'Class') ],
            parameters: [
              objectLoader.createCompactedResource({ '@id': 'http://example.org/HelloWorldModule#dummyParamLazy', lazy: objectLoader.createCompactedResource('"true"') }),
              objectLoader.createCompactedResource({ '@id': 'http://example.org/HelloWorldModule#instanceParamLazy', lazy: objectLoader.createCompactedResource('"true"') }),
              objectLoader.createCompactedResource({ '@id': 'http://example.org/HelloWorldModule#idParamLazy', lazy: objectLoader.createCompactedResource('"true"') })
            ],
            constructorArguments: objectLoader.createCompactedResource({
              list: [
                objectLoader.createCompactedResource({
                  fields: [
                    { key: objectLoader.createCompactedResource('"dummyParamLazy"'), value: objectLoader.createCompactedResource({ '@id': 'http://example.org/HelloWorldModule#dummyParamLazy', lazy: objectLoader.createCompactedResource('"true"') }) },
                    { key: objectLoader.createCompactedResource('"instanceParamLazy"'), value: objectLoader.createCompactedResource({ '@id': 'http://example.org/HelloWorldModule#instanceParamLazy', lazy: objectLoader.createCompactedResource('"true"') }) },
                    { key: objectLoader.createCompactedResource('"idParamLazy"'), value: objectLoader.createCompactedResource(Util.PREFIXES['rdf'] + 'subject') }
                  ]
                })
              ]
            })
          });
          module = objectLoader.createCompactedResource({
            '@id': 'http://example.org/helloworld',
            requireName: '"helloworld"',
            components: [
              helloWorldComponent8,
            ]
          });
            constructor = new MappedNamedComponentFactory(module, helloWorldComponent8, objectLoader.createCompactedResource({
                'http://example.org/HelloWorldModule#dummyParamLazy': objectLoader.createCompactedResource('"true"'),
            }), true, {}, loader);
        });

        it('should be valid', function () {
            expect(constructor).toBeTruthy();
        });

        it('should create valid arguments', async() => {
          const args = await constructor.makeArguments();
          expect(await args[0]['dummyParamLazy'][0]()).toEqual('true');
        });

        it('should make a valid instance', async() => {
          const instance = await constructor.create();
          expect(instance).toBeTruthy();
          expect(instance).toBeInstanceOf(Hello);
        });
    });

  describe('for a hello world component with variables', function () {
    let helloWorldComponent: Resource;
    let module: Resource;
    let constructor: MappedNamedComponentFactory;
    beforeEach(function () {
      helloWorldComponent = objectLoader.createCompactedResource({
        '@id': 'http://example.org/HelloWorldModule#SayHelloComponent2',
        requireElement: objectLoader.createCompactedResource('"Hello"'),
        types: [ objectLoader.createCompactedResource(Util.PREFIXES['oo'] + 'Class') ],
        parameters: [
          objectLoader.createCompactedResource('http://example.org/HelloWorldModule#dummyParam'),
          objectLoader.createCompactedResource('http://example.org/HelloWorldModule#instanceParam')
        ],
        constructorArguments: objectLoader.createCompactedResource({
          list: [
            objectLoader.createCompactedResource({
              fields: [
                { key: objectLoader.createCompactedResource('"dummyParam"'), value: objectLoader.createCompactedResource('http://example.org/HelloWorldModule#dummyParam') },
                { key: objectLoader.createCompactedResource('"instanceParam"'), value: objectLoader.createCompactedResource('http://example.org/HelloWorldModule#instanceParam') }
              ]
            })
          ]
        })
      });
      module = objectLoader.createCompactedResource({
        '@id': 'http://example.org/helloworld',
        requireName: '"helloworld"',
        components: [
          helloWorldComponent,
        ]
      });

      const variable: Resource = objectLoader.createCompactedResource('ex:var');
      variable.properties.types.push(objectLoader.createCompactedResource(Util.PREFIXES['om'] + 'Variable'));
      constructor = new MappedNamedComponentFactory(module, helloWorldComponent, objectLoader.createCompactedResource({
        'http://example.org/HelloWorldModule#dummyParam': variable,
      }), true, {}, loader);
    });

    it('should be valid', function () {
      expect(constructor).toBeTruthy();
    });

    it('should create valid arguments', async() => {
      const args = await constructor.makeArguments({
        variables: {
          'ex:var': 3000,
        },
      });
      expect(args).toEqual([{
        'dummyParam': [ 3000 ],
      }]);
    });

    it('should throw when a variable remains undefined', async() => {
      await expect(constructor.makeArguments({
        variables: objectLoader.createCompactedResource({}),
      })).rejects.toThrow(new Error('Undefined variable: ex:var'));
    });

    it('should throw when no variables are passed', async() => {
      await expect(constructor.makeArguments()).rejects.toThrow(new Error('Undefined variable: ex:var'));
    });

    it('should make a valid instance', async() => {
      const instance = await constructor.create({
        variables: {
          'ex:var': 3000,
        },
      });
      expect(instance).toBeTruthy();
      expect(instance).toBeInstanceOf(Hello);
      expect(instance._params.dummyParam).toEqual([ 3000 ]);
    });
  });

});