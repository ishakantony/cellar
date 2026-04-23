import 'dotenv/config';

import { syncFirstPartyClients } from '../src/lib/oidc/sync-clients';

async function main() {
  const result = await syncFirstPartyClients({
    disableMissing: process.env.OIDC_DISABLE_MISSING_CLIENTS === 'true',
  });

  console.log(
    JSON.stringify(
      {
        synced: result.synced,
        disabled: result.disabled,
      },
      null,
      2
    )
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
