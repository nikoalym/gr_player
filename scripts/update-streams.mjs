#!/usr/bin/env node

import { promises as fs } from "fs";
import path from "path";

/**
 * Check if a single stream URL is available
 */
async function checkStreamAvailability(url) {
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
async function checkStreamsInBatches(streams, batchSize = 3) {
  const results = [];

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
 * Parse M3U content
 */
function parseM3U(content) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);
  const channels = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for EXTINF lines
    if (line.startsWith("#EXTINF:")) {
      const extinf = line;
      const url = lines[i + 1]; // Next line should be the URL

      if (url && !url.startsWith("#")) {
        const channel = parseEXTINF(extinf, url);
        if (channel) {
          channels.push(channel);
        }
        i++; // Skip the URL line since we've processed it
      }
    }
  }

  return channels;
}

/**
 * Parse EXTINF line
 */
function parseEXTINF(extinf, url) {
  try {
    // Extract duration (number after EXTINF:)
    const durationMatch = extinf.match(/#EXTINF:([^,\s]+)/);
    const duration = durationMatch ? parseFloat(durationMatch[1]) : undefined;

    // Extract attributes using regex
    const groupMatch = extinf.match(/group-title="([^"]+)"/);
    const tvgNameMatch = extinf.match(/tvg-name="([^"]+)"/);
    const logoMatch = extinf.match(/tvg-logo="([^"]+)"/);

    // Extract channel name (text after the last comma)
    const nameMatch = extinf.match(/,([^,]+)$/);

    const group = groupMatch ? groupMatch[1] : "Unknown";
    const tvgName = tvgNameMatch ? tvgNameMatch[1] : undefined;
    const logo = logoMatch ? logoMatch[1] : undefined;
    const name = nameMatch ? nameMatch[1].trim() : "Unknown Channel";

    return {
      name,
      url: url.trim(),
      logo,
      group,
      tvgName,
      duration: duration !== -1 ? duration : undefined,
    };
  } catch (error) {
    console.error("Error parsing EXTINF line:", extinf, error);
    return null;
  }
}

/**
 * Fetch streams from the M3U source
 */
async function getStreams() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/free-greek-iptv/greek-iptv/beb997e089f6a8fd5b0d62251516f82dac392c3b/Greekstreamtv.m3u"
    );
    const text = await response.text();

    return parseM3U(text);
  } catch (error) {
    console.error("Error fetching streams:", error);
    return [];
  }
}

/**
 * Generate streams JSON file
 */
async function generateStreamsFile(streams) {
  // List of channels to remove manually
  const channelsToRemove = [
    "BOOBA",
    "ERT NEWS",
    "ERT SPORTS",
    "ERT SPORTS 1",
    "ERT SPORTS 2",
    "ERT SPORTS 3",
    "ERT SPORTS 4",
    "ERT SPORTS 5",
    "ERT SPORTS 6",
    "ERT WORLD",
    "FIGARO",
    "GROOVY",
    "MAD TV",
    "PEMPTOUSIA TV",
  ];

  // Filter out unwanted channels and HTTP URLs
  const filteredStreams = streams
    .filter((stream) => !channelsToRemove.includes(stream.name))
    .filter((stream) => !stream.url.startsWith("http://"));

  // Create simplified stream data
  const simpleStreams = filteredStreams.map((stream) => ({
    name: stream.name,
    url: stream.url,
    enabled: stream.enabled ?? false,
  }));

  // Sort streams: enabled first, then by name
  simpleStreams.sort((a, b) => {
    if (a.enabled !== b.enabled) {
      return a.enabled ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  const fileContent = {
    lastUpdated: new Date().toISOString(),
    totalStreams: filteredStreams.length,
    enabledStreams: filteredStreams.filter((s) => s.enabled).length,
    streams: simpleStreams,
  };

  // Ensure directory exists
  const dataDir = path.join(process.cwd(), "src", "lib", "data");
  await fs.mkdir(dataDir, { recursive: true });

  // Write streams.json file
  const filePath = path.join(dataDir, "streams.json");
  await fs.writeFile(filePath, JSON.stringify(fileContent, null, 2), "utf-8");

  console.log(`Generated streams file: ${filePath}`);
  return filePath;
}

async function main() {
  try {
    console.log("Fetching and checking streams...");

    // Fetch streams from source
    const rawStreams = await getStreams();

    if (!rawStreams.length) {
      console.error("No streams found");
      process.exit(1);
    }

    console.log(`Checking ${rawStreams.length} streams...`);

    // Check stream availability
    const checkedStreams = await checkStreamsInBatches(rawStreams, 3);

    // Generate the JSON file
    await generateStreamsFile(checkedStreams);

    // Calculate stats (after filtering)
    const channelsToRemove = [
      "BOOBA",
      "ERT NEWS",
      "ERT WORLD",
      "FIGARO",
      "GROOVY",
      "MAD TV",
    ];

    const filteredStreams = checkedStreams
      .filter((stream) => !channelsToRemove.includes(stream.name))
      .filter((stream) => !stream.url.startsWith("http://"));

    const stats = {
      total: filteredStreams.length,
      enabled: filteredStreams.filter((s) => s.enabled).length,
      disabled: filteredStreams.filter((s) => !s.enabled).length,
    };

    console.log(`Complete! ${stats.enabled}/${stats.total} streams available`);
    console.log(
      `Enabled percentage: ${Math.round((stats.enabled / stats.total) * 100)}%`
    );
  } catch (error) {
    console.error("Error updating streams:", error);
    process.exit(1);
  }
}

// Run the main function
main();
