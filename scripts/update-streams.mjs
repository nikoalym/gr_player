#!/usr/bin/env node

import { promises as fs } from "fs";
import path from "path";

// Configuration constants
const CONFIG = {
  M3U_URL: "https://raw.githubusercontent.com/free-greek-iptv/greek-iptv/beb997e089f6a8fd5b0d62251516f82dac392c3b/Greekstreamtv.m3u",
  TIMEOUT_MS: 8000,
  BATCH_SIZE: 3,
  BATCH_DELAY_MS: 500,
  USER_AGENT: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  CHANNELS_TO_REMOVE: [
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
  ],
  OUTPUT_PATH: path.join(process.cwd(), "src", "lib", "data", "streams.json"),
};

/**
 * Check if a single stream URL is available
 * @param {string} url - The stream URL to check
 * @returns {Promise<boolean>} - Whether the stream is available
 */
async function checkStreamAvailability(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": CONFIG.USER_AGENT,
      },
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check multiple streams in batches to avoid overwhelming the servers
 * @param {Array} streams - Array of stream objects to check
 * @param {number} batchSize - Number of streams to check concurrently
 * @returns {Promise<Array>} - Array of streams with enabled status
 */
async function checkStreamsInBatches(streams, batchSize = CONFIG.BATCH_SIZE) {
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
      await new Promise((resolve) => setTimeout(resolve, CONFIG.BATCH_DELAY_MS));
    }
  }

  return results;
}

/**
 * Parse M3U content into channel objects
 * @param {string} content - The M3U file content
 * @returns {Array} - Array of parsed channel objects
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
 * Parse EXTINF line to extract channel information
 * @param {string} extinf - The EXTINF line
 * @param {string} url - The stream URL
 * @returns {Object|null} - Parsed channel object or null if parsing fails
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
 * @returns {Promise<Array>} - Array of parsed stream objects
 */
async function fetchStreams() {
  try {
    const response = await fetch(CONFIG.M3U_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    return parseM3U(text);
  } catch (error) {
    console.error("Error fetching streams:", error);
    throw error;
  }
}

/**
 * Filter streams by removing unwanted channels and insecure URLs
 * @param {Array} streams - Array of stream objects
 * @returns {Array} - Filtered array of streams
 */
function filterStreams(streams) {
  return streams
    .filter((stream) => !CONFIG.CHANNELS_TO_REMOVE.includes(stream.name))
    .filter((stream) => !stream.url.startsWith("http://"));
}

/**
 * Create simplified stream data and sort by availability
 * @param {Array} streams - Array of stream objects with enabled status
 * @returns {Array} - Simplified and sorted stream objects
 */
function processStreams(streams) {
  const filteredStreams = filterStreams(streams);
  
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

  return simpleStreams;
}

/**
 * Generate and write the streams JSON file
 * @param {Array} streams - Array of processed stream objects
 * @returns {Promise<string>} - Path to the generated file
 */
async function writeStreamsFile(streams) {
  const fileContent = {
    lastUpdated: new Date().toISOString(),
    totalStreams: streams.length,
    enabledStreams: streams.filter((s) => s.enabled).length,
    streams,
  };

  // Ensure directory exists
  const dataDir = path.dirname(CONFIG.OUTPUT_PATH);
  await fs.mkdir(dataDir, { recursive: true });

  // Write streams.json file
  await fs.writeFile(CONFIG.OUTPUT_PATH, JSON.stringify(fileContent, null, 2), "utf-8");

  console.log(`Generated streams file: ${CONFIG.OUTPUT_PATH}`);
  return CONFIG.OUTPUT_PATH;
}

/**
 * Calculate and display statistics about the streams
 * @param {Array} streams - Array of processed stream objects
 */
function displayStats(streams) {
  const stats = {
    total: streams.length,
    enabled: streams.filter((s) => s.enabled).length,
    disabled: streams.filter((s) => !s.enabled).length,
  };

  console.log(`Complete! ${stats.enabled}/${stats.total} streams available`);
  console.log(`Enabled percentage: ${Math.round((stats.enabled / stats.total) * 100)}%`);
}

/**
 * Main function to orchestrate the stream update process
 */
async function main() {
  try {
    console.log("Fetching and checking streams...");

    // Fetch streams from source
    const rawStreams = await fetchStreams();

    if (!rawStreams.length) {
      throw new Error("No streams found");
    }

    console.log(`Checking ${rawStreams.length} streams...`);

    // Check stream availability
    const checkedStreams = await checkStreamsInBatches(rawStreams);

    // Process and filter streams
    const processedStreams = processStreams(checkedStreams);

    // Generate the JSON file
    await writeStreamsFile(processedStreams);

    // Display statistics
    displayStats(processedStreams);
    
  } catch (error) {
    console.error("Error updating streams:", error);
    process.exit(1);
  }
}

// Run the main function
main();
