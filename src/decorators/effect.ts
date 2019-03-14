import { createEffectEvent } from '../helpers';
import { getSinkBuilder } from '../sink-builder';

export function effect(target: any, name: string, descriptor: PropertyDescriptor) {
  const sinkBuilder = getSinkBuilder(target);

  if (!sinkBuilder.built) {
    // create effect event
    const handler = descriptor.value.bind(target);
    const effectFunction = (store: any, payload: any) => handler(...payload);
    const effectEvent = createEffectEvent(effectFunction);

    sinkBuilder.effects.push(effectEvent);
    sinkBuilder.actions[name] = effectEvent.action.toString();

    // create dispatch action
    const dispatchAction = (...payloads: any[]) => sinkBuilder.dispatch(effectEvent.action(payloads));
    sinkBuilder.dispatches[name] = dispatchAction;
  }

  descriptor.value = sinkBuilder.dispatches[name];
  return descriptor;
}