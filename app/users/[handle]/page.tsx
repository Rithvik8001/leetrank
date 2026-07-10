import { permanentRedirect } from "next/navigation";

export default async function LegacyPublicProfile({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  permanentRedirect(`/u/${encodeURIComponent(handle.toLowerCase())}`);
}
