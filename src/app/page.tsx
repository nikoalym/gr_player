import PlayerShell from "@/components/player-shell";
import { promises as fs } from "fs";
export default async function Home() {
  const file = await fs.readFile(
    process.cwd() + "/src/lib/data/streams.json",
    "utf8"
  );

  const streamInfo = JSON.parse(file);

  return (
    <div className="flex">
      <PlayerShell streams={streamInfo.streams} />
    </div>
  );
}
