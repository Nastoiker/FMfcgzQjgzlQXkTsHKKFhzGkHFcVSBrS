// В соседней вкладке могут оставаться данные предыдущей учётной записи.
let changes: BroadcastChannel | undefined;

export const syncSessionTabs = (): void => {
  if (typeof BroadcastChannel === 'undefined') return;
  changes = new BroadcastChannel('atlas-session');
  changes.onmessage = () => {
    location.reload();
  };
};

export const notifySessionChange = (): void => changes?.postMessage('changed');
