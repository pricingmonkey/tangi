import { makeActorContext } from '@pricingmonkey/tangi';

const local = await makeActorContext(self);
local.receiveMessage(msg => {
  if (msg._tag === 'PING') {
    return { _tag: 'PONG' };
  }
});
