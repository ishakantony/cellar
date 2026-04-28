import '../../load-env';
import { syncFirstPartyClients } from './sync-clients';

const disableMissing = process.env.OIDC_DISABLE_MISSING_CLIENTS === 'true';

syncFirstPartyClients({ disableMissing })
  .then(result => {
    console.info(
      `[cellar] OIDC clients synced: ${result.synced.join(', ') || 'none'}` +
        (disableMissing ? ` (disabled ${result.disabled} missing)` : '')
    );
    process.exit(0);
  })
  .catch(error => {
    console.error('[cellar] OIDC sync failed:', error);
    process.exit(1);
  });
