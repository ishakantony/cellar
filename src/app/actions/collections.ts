"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function createCollection(data: {
  name: string;
  description?: string;
  color?: string;
}) {
  const user = await getUser();
  const collection = await prisma.collection.create({
    data: {
      ...data,
      userId: user.id,
    },
  });
  revalidatePath("/collections");
  revalidatePath("/dashboard");
  return collection;
}

export async function updateCollection(
  id: string,
  data: {
    name?: string;
    description?: string;
    color?: string;
  }
) {
  const user = await getUser();
  const collection = await prisma.collection.update({
    where: { id, userId: user.id },
    data,
  });
  revalidatePath("/collections");
  revalidatePath("/dashboard");
  return collection;
}

export async function deleteCollection(id: string) {
  const user = await getUser();
  await prisma.collection.delete({
    where: { id, userId: user.id },
  });
  revalidatePath("/collections");
  revalidatePath("/dashboard");
}

export async function getCollections() {
  const user = await getUser();
  return prisma.collection.findMany({
    where: { userId: user.id },
    include: { _count: { select: { assets: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCollection(id: string) {
  const user = await getUser();
  return prisma.collection.findUnique({
    where: { id, userId: user.id },
    include: {
      assets: {
        include: { asset: true },
        orderBy: { asset: { updatedAt: "desc" } },
      },
      _count: { select: { assets: true } },
    },
  });
}

export async function toggleCollectionPin(id: string) {
  const user = await getUser();
  const collection = await prisma.collection.findUnique({
    where: { id, userId: user.id },
  });
  if (!collection) throw new Error("Collection not found");
  await prisma.collection.update({
    where: { id, userId: user.id },
    data: { pinned: !collection.pinned },
  });
  revalidatePath("/collections");
  revalidatePath("/dashboard");
}

export async function addAssetToCollection(
  assetId: string,
  collectionId: string
) {
  const user = await getUser();

  // Verify both belong to user
  const [asset, collection] = await Promise.all([
    prisma.asset.findUnique({ where: { id: assetId, userId: user.id } }),
    prisma.collection.findUnique({
      where: { id: collectionId, userId: user.id },
    }),
  ]);
  if (!asset || !collection) throw new Error("Not found");

  await prisma.assetCollection.create({
    data: { assetId, collectionId },
  });
  revalidatePath("/collections");
}

export async function removeAssetFromCollection(
  assetId: string,
  collectionId: string
) {
  const user = await getUser();

  // Verify collection belongs to user
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId, userId: user.id },
  });
  if (!collection) throw new Error("Collection not found");

  await prisma.assetCollection.delete({
    where: {
      assetId_collectionId: { assetId, collectionId },
    },
  });
  revalidatePath("/collections");
}
