import { getCollection } from "@/app/actions/collections";
import { CollectionDetailClient } from "./collection-detail-client";
import { notFound } from "next/navigation";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollection(id);
  if (!collection) notFound();

  return <CollectionDetailClient collection={collection} />;
}
