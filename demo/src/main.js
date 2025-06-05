import { makeActorContext } from '@pricingmonkey/tangi';

const worker = new Worker(new URL('./worker.js', import.meta.url));
const remote = makeActorContext(worker);

remote.ask(id => ({ _tag: 'PING', id }))
  .then(console.log)     // → { _tag: "PONG" }
  .catch(console.error);
