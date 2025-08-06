import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";
import getStreams from "../../../lib/data/streams";

/**
 * Check if a single stream URL is available
 */
async function checkStreamAvailability(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check multiple streams in batches
 */
async function checkStreamsInBatches(
  streams: ChStream[],
  batchSize: number = 3
): Promise<ChStream[]> {
  const results: ChStream[] = [];

  for (let i = 0; i < streams.length; i += batchSize) {
    const batch = streams.slice(i, i + batchSize);

    const batchPromises = batch.map(async (stream) => {
      const enabled = await checkStreamAvailability(stream.url);
      return { ...stream, enabled };
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Small delay between batches to be respectful
    if (i + batchSize < streams.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Generate simplified JSON file in /data directory
 */
async function generateStreamsFile(streams: ChStream[]): Promise<void> {
  // Create simplified stream data with only name, url, and enabled fields
  const simpleStreams = streams.map((stream) => ({
    name: stream.name,
    url: stream.url,
    enabled: stream.enabled ?? false,
  }));

  // Sort streams: enabled first, then by name
  simpleStreams.sort((a, b) => {
    if (a.enabled !== b.enabled) {
      return a.enabled ? -1 : 1; // enabled streams first
    }
    return a.name.localeCompare(b.name);
  });

  const fileContent = {
    lastUpdated: new Date().toISOString(),
    totalStreams: streams.length,
    enabledStreams: streams.filter((s) => s.enabled).length,
    streams: simpleStreams,
  };

  // Ensure public/data directory exists
  const dataDir = join(process.cwd(), "src", "lib", "data");
  await mkdir(dataDir, { recursive: true });

  // Write streams.json file
  const filePath = join(dataDir, "streams.json");
  await writeFile(filePath, JSON.stringify(fileContent, null, 2), "utf-8");

  console.log(`Generated streams file: ${filePath}`);
}

export async function GET() {
  try {
    console.log("Fetching and checking streams...");

    // Fetch streams from source
    const rawStreams = await getStreams();

    if (!rawStreams.length) {
      return NextResponse.json({ error: "No streams found" }, { status: 404 });
    }

    console.log(`Checking ${rawStreams.length} streams...`);

    // Check stream availability
    const checkedStreams = await checkStreamsInBatches(rawStreams, 3);

    // Generate the JSON file
    await generateStreamsFile(checkedStreams);

    // Calculate stats
    const stats = {
      total: checkedStreams.length,
      enabled: checkedStreams.filter((s) => s.enabled).length,
      disabled: checkedStreams.filter((s) => !s.enabled).length,
    };

    console.log(`Complete! ${stats.enabled}/${stats.total} streams available`);

    return NextResponse.json({
      success: true,
      message: "Streams file generated successfully",
      filePath: "/data/streams.json",
      stats: {
        ...stats,
        enabledPercentage: Math.round((stats.enabled / stats.total) * 100),
      },
    });
  } catch (error) {
    console.error("Error generating streams file:", error);
    return NextResponse.json(
      { error: "Failed to generate streams file" },
      { status: 500 }
    );
  }
}
