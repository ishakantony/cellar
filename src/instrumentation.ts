export function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  void import('@/lib/startup-report').then(({ logStartupReportOnce }) => {
    logStartupReportOnce();
  });
}
