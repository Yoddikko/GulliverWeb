/* Gulliver — Release wiring. Fetches latest GitHub release and populates the download button. */

(function () {
  "use strict";

  const OWNER = "Yoddikko";
  const REPO = "GulliverWeb";

  function readableSize(bytes) {
    if (!bytes || !Number.isFinite(bytes)) return "";
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 ** 3)).toFixed(1) + " GB";
    if (bytes >= 1024 * 1024) return Math.round(bytes / (1024 ** 2)) + " MB";
    return Math.round(bytes / 1024) + " KB";
  }

  function isMacAsset(name) {
    return /\bmac/i.test(name) || /\.dmg$/i.test(name) || /\.pkg$/i.test(name) ||
           /darwin/i.test(name) || /\.app\.zip$/i.test(name) || /\.app\.tar\.gz$/i.test(name);
  }

  function findMacAsset(release) {
    if (!release || !Array.isArray(release.assets)) return null;
    for (const asset of release.assets) {
      if (asset.state === "uploaded" && isMacAsset(asset.name)) return asset;
    }
    return null;
  }

  function getVersion(release) {
    const fromName = release && release.name && release.name.match(/v?\d+(\.\d+){0,2}/);
    if (fromName) return fromName[0];
    if (release && release.tag_name && release.tag_name !== "latest") return release.tag_name;
    return "";
  }

  async function fetchLatestRelease() {
    try {
      const res = await fetch(
        "https://api.github.com/repos/" + OWNER + "/" + REPO + "/releases/latest",
        { headers: { Accept: "application/vnd.github.v3+json" } }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async function init() {
    const downloadBtn = document.getElementById("hero-download");
    const metaEl = document.getElementById("hero-download-meta");
    const release = await fetchLatestRelease();
    const macAsset = findMacAsset(release);
    const version = getVersion(release);

    if (downloadBtn && macAsset) {
      downloadBtn.href = macAsset.browser_download_url;
    } else if (downloadBtn) {
      downloadBtn.href = "https://github.com/" + OWNER + "/" + REPO + "/releases/latest";
    }

    if (metaEl && macAsset) {
      const parts = [];
      if (version) parts.push(version);
      if (macAsset.size) parts.push(readableSize(macAsset.size));
      metaEl.textContent = parts.join(" · ");
    } else if (metaEl && version) {
      metaEl.textContent = "v" + version;
    }

  }

  document.addEventListener("DOMContentLoaded", init);
})();
