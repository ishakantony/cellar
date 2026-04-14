import { getCollections } from "@/app/actions/collections";
import { CollectionsClient } from "./collections-client";

export default async function CollectionsPage() {
  const collections = await getCollections();
  return <CollectionsClient collections={collections} />;
}
