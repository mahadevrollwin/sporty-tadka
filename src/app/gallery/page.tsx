import { redirect } from "next/navigation";

export const revalidate = 60;

export default async function GalleryIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  redirect(params.tab === "videos" ? "/gallery/videos" : "/gallery/images");
}
