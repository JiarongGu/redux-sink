
import { SinkBuilder } from '../SinkBuilder';

/**
 * set the action ad reloader, will be fired when new trigger first got registered
 * @param target prototype
 * @param name name of reloader
 */
export function reloader(target: any, name: string) {
  const sinkBuilder = SinkBuilder.get(target);
  sinkBuilder.reloaders[name] = name;
}