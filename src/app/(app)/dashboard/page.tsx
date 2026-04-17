import { getDashboardData } from '@/app/actions/assets';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <DashboardClient
      pinnedAssets={data.pinnedAssets}
      pinnedCollections={data.pinnedCollections}
      recentAssets={data.recentAssets}
    />
  );
}
