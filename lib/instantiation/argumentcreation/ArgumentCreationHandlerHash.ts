import type { Resource } from 'rdf-object';
import * as Util from '../../Util';
import type { IInstantiationSettingsInner } from '../IInstantiationSettings';
import type { IArgumentCreationHandler } from './IArgumentCreationHandler';
import type { IArgumentsCreator } from './IArgumentsCreator';

/**
 * Handles arguments with fields as hashes.
 */
export class ArgumentCreationHandlerHash implements IArgumentCreationHandler {
  public canHandle<Instance>(
    value: Resource,
    settings: IInstantiationSettingsInner<Instance>,
    argsCreator: IArgumentsCreator,
  ): boolean {
    return Boolean(value.property.fields || value.property.hasFields);
  }

  public async handle<Instance>(
    value: Resource,
    settings: IInstantiationSettingsInner<Instance>,
    argsCreator: IArgumentsCreator,
  ): Promise<Instance> {
    // Determine all key-value pairs
    const entries = await Promise.all(value.properties.fields.map(async(entry: Resource) => {
      // Validate entry
      if (!entry.property.key) {
        throw new Error(`Missing key in fields entry.
Entry: ${Util.resourceToString(entry)}
Fields: ${Util.resourceToString(value)}`);
      }
      if (entry.property.key.type !== 'Literal') {
        throw new Error(`Illegal non-literal key (${Util.resourceIdToString(entry.property.key, argsCreator.objectLoader)} as ${entry.property.key.type}) in fields entry.
Entry: ${Util.resourceToString(entry)}
Fields: ${Util.resourceToString(value)}`);
      }

      // Recursively get value arg value
      if (entry.property.value) {
        const subValue = await argsCreator.getArgumentValues(entry.properties.value, settings);
        return { key: entry.property.key.value, value: subValue };
      }
      // TODO: should we throw if value is missing?
      // return Promise.reject(
      // new Error('Parameter object entries must have values, but found: ' + JSON.stringify(entry, null, '  ')));
    }));

    // Create a hash containing the key-value pairs
    return settings.creationStrategy.createHash({ settings, entries });
  }
}
