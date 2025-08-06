import PlayerShell from "@/components/player-shell";
import getStreams from "@/lib/data/streams";

export default async function Home() {
  const streams = await getStreams();
  return (
    <div className="flex">
      <PlayerShell streams={streams} />
    </div>
  );
}
