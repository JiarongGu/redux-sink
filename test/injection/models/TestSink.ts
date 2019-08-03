import { sink } from '../../../src';
import { SinkContainer } from '../../../src/SinkContainer';
import { SinkFactory } from '../../../src/SinkDefaults';
import { InjectableSink } from './InjectableSink';

// this test sink injected with sink and container object
// the sink should be resolved to sink object and reflect to the container of test sink
// the injected container should remain in a clean separated container
// SinkFactory is a default sink container equivalent to a regular sink container
@sink('test', InjectableSink, new SinkContainer(), SinkFactory, undefined)
export class TestSink {
  constructor(
    public injectableSink: InjectableSink,
    public container: SinkContainer,
    public factory: SinkContainer,
    public notDefined: any,
  ) {}
}
