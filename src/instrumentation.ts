export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  const { logStartupReportOnce } = await import('@/lib/startup-report');
  logStartupReportOnce();
}
