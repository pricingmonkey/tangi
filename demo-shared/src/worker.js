import {makeActorContext} from '@pricingmonkey/tangi';

const local = await makeActorContext(() => {
  return new Promise(resolve => {
    self.onconnect = event => {
      resolve(event.ports[0]);
    }
  });
});
local.receiveMessage(msg => {
  if (msg._tag === 'PING') {
    return { _tag: 'PONG' };
  }
});
