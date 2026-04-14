import { AssetType } from "@/generated/prisma";
import { getAssets } from "@/app/actions/assets";
import { AssetsClient } from "./assets-client";
import { Suspense } from "react";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    sort?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const type = (params.type as AssetType) || null;
  const sort = params.sort || "newest";
  const q = params.q || "";

  const assets = await getAssets({
    type: type ?? undefined,
    sort: sort as "newest" | "oldest" | "az" | "za",
    q: q || undefined,
  });

  return (
    <Suspense>
      <AssetsClient
        assets={assets}
        currentType={type}
        currentSort={sort}
        searchQuery={q}
      />
    </Suspense>
  );
}
