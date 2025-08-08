# GitHub Workflows

## Update Streams Data

This workflow automatically updates the streams data daily by:

1. **Schedule**: Runs every day at 6:00 AM UTC
2. **Manual Trigger**: Can be manually triggered from the GitHub Actions tab
3. **Process**:
   - Fetches the latest Greek TV streams from the M3U playlist
   - Checks each stream's availability (in batches to be respectful)
   - Updates `src/lib/data/streams.json` with availability status
   - Commits and pushes changes if streams status has changed

## How it works

The workflow uses the standalone script `scripts/update-streams.mjs` which:
- Fetches streams from: `https://raw.githubusercontent.com/free-greek-iptv/greek-iptv/...`
- Checks each stream URL with a HEAD request (8-second timeout)
- Sorts streams with enabled ones first, then alphabetically
- Only commits changes if the streams.json file actually changed

## Benefits

- **No build required**: The script runs independently without building the Next.js app
- **Efficient**: Only commits when there are actual changes
- **Respectful**: Batch processing with delays to avoid overwhelming stream servers
- **Automatic**: Keeps your stream data fresh without manual intervention

## Files involved

- `.github/workflows/update-streams.yml` - The GitHub Action workflow
- `scripts/update-streams.mjs` - The standalone update script
- `src/lib/data/streams.json` - The generated streams data file
- `package.json` - Contains the `update-streams` npm script

## Manual usage

You can also run the update locally:

```bash
npm run update-streams
```

Or directly:

```bash
node scripts/update-streams.mjs
```
