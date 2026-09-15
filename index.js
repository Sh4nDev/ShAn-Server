#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');
const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const USER_CONFIG_PATH = path.join(os.homedir(), '.shan-server', 'config.json');

function loadPersistedConfig() {
  try {
    if (fs.existsSync(USER_CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(USER_CONFIG_PATH, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function savePersistedConfig(partial) {
  try {
    const dir = path.dirname(USER_CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const current = loadPersistedConfig();
    const merged = { ...current, ...partial };
    fs.writeFileSync(USER_CONFIG_PATH, JSON.stringify(merged, null, 2));
    return merged;
  } catch (e) {
    return null;
  }
}

const persisted = loadPersistedConfig();

const CONFIG = {
  apiBase: process.env.SHAN_API_BASE || persisted.apiBase || 'https://shans-api-07-p00o.onrender.com/' || 'https://sh-ans-api-07.vercel.app/',
  downloadDir: process.env.SHAN_DOWNLOAD_DIR || persisted.downloadDir || path.join(process.cwd(), 'downloads'),
  requestTimeoutMs: parseInt(process.env.SHAN_TIMEOUT_MS || persisted.requestTimeoutMs || '60000', 10),
  batchConcurrency: parseInt(process.env.SHAN_CONCURRENCY || persisted.batchConcurrency || '3', 10),
  maxRetries: parseInt(process.env.SHAN_RETRIES || persisted.maxRetries || '2', 10),
  retryBaseDelayMs: parseInt(process.env.SHAN_RETRY_DELAY_MS || persisted.retryBaseDelayMs || '400', 10),
  defaultAuthor: persisted.defaultAuthor || null,
  defaultUid: persisted.defaultUid || null,
  defaultFont: persisted.defaultFont || null
};

// --------------------------------------------------------------
// LIGHTWEIGHT FILE LOGGER
// --------------------------------------------------------------
function logEvent(level, message) {
  try {
    const dir = downloadManagerLogDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(path.join(dir, 'activity.log'), line);
  } catch (e) {
    // Logging must never crash the app
  }
}
function downloadManagerLogDir() {
  return path.join(CONFIG.downloadDir, 'logs');
}

// --------------------------------------------------------------
// RETRY HELPER - exponential backoff for flaky network calls
// --------------------------------------------------------------
async function withRetry(fn, { retries = CONFIG.maxRetries, baseDelayMs = CONFIG.retryBaseDelayMs, label = 'request' } = {}) {
  let attempt = 0;
  let lastError;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err?.response?.status;
      // Don't retry on client errors (4xx) - those won't fix themselves
      if (status && status >= 400 && status < 500) throw err;
      attempt++;
      if (attempt > retries) break;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      logEvent('warn', `${label} failed (attempt ${attempt}/${retries}): ${err.message}. Retrying in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

// --------------------------------------------------------------
// CONCURRENCY-LIMITED ASYNC POOL - used for parallel batch downloads
// --------------------------------------------------------------
async function asyncPool(limit, items, iteratorFn) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const current = cursor++;
      results[current] = await iteratorFn(items[current], current);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// --------------------------------------------------------------
// AUTO-AUTHOR DETECTION (now actually returns the detected user)
// --------------------------------------------------------------
function getDefaultAuthor() {
  try {
    const username = os.userInfo().username;
    if (username && username !== 'root' && username !== 'admin') {
      return '♡︎ 𝗦𝗵𝗔𝗻 ♡︎';
    }
  } catch (e) {}

  const envUser = process.env.USER || process.env.USERNAME || process.env.LOGNAME;
  if (envUser && envUser !== 'root' && envUser !== 'admin') {
    return '♡︎ 𝗦𝗵𝗔𝗻 ♡︎';
  }

  return 'Guest';
}

// Detect platform
function getPlatform() {
  const platform = os.platform();
  const platformMap = {
    'win32': 'Windows',
    'linux': 'Linux',
    'darwin': 'macOS',
    'android': 'Termux/Android',
    'chrome': 'Chrome OS'
  };
  return platformMap[platform] || platform;
}

function getTerminalType() {
  const term = process.env.TERM || process.env.TERM_PROGRAM || '';
  if (term.includes('xterm') || term.includes('linux')) return 'Terminal';
  if (term.includes('tmux')) return 'Tmux';
  if (term.includes('screen')) return 'Screen';
  if (process.env.TERM_PROGRAM === 'iTerm.app') return 'iTerm2';
  if (process.env.TERM_PROGRAM === 'Apple_Terminal') return 'macOS Terminal';
  if (process.env.TERM_PROGRAM === 'Hyper') return 'Hyper';
  if (process.env.TERM_PROGRAM === 'Alacritty') return 'Alacritty';
  if (process.env.TERM_PROGRAM === 'vscode') return 'VS Code Terminal';
  if (process.env.TERM_PROGRAM === 'WSL') return 'WSL';
  if (process.env.TERM_PROGRAM === 'Cygwin') return 'Cygwin';
  if (process.env.TERM_PROGRAM === 'Mintty') return 'Mintty';
  if (process.env.TERM_PROGRAM === 'Konsole') return 'Konsole';
  if (process.env.TERM_PROGRAM === 'GNOME-Terminal') return 'GNOME Terminal';
  return 'Unknown Terminal';
}

function getShell() {
  const shell = process.env.SHELL || process.env.COMSPEC || '';
  if (shell.includes('bash')) return 'Bash';
  if (shell.includes('zsh')) return 'Zsh';
  if (shell.includes('fish')) return 'Fish';
  if (shell.includes('cmd')) return 'CMD';
  if (shell.includes('powershell') || shell.includes('pwsh')) return 'PowerShell';
  if (shell.includes('sh')) return 'Sh';
  if (shell.includes('dash')) return 'Dash';
  if (shell.includes('ksh')) return 'Ksh';
  return 'Unknown Shell';
}

// --------------------------------------------------------------
// URL VALIDATION
// --------------------------------------------------------------
function isValidHttpUrl(value) {
  if (!value || typeof value !== 'string') return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// --------------------------------------------------------------
// RESPONSE FORMATTER - Extract data from API response
// --------------------------------------------------------------
function extractResponseData(data) {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (data.ShAn) return data.ShAn;
  if (data.data) return data.data;
  if (data.response) return data.response;
  if (data.result) return data.result;
  if (data.message) return data.message;
  return data;
}

function formatResponse(data, type) {
  const responseData = extractResponseData(data);
  if (!responseData) return 'No response received';
  if (typeof responseData === 'string') return responseData;

  switch(type) {
    case 'baby':
    case 'honey':
    case 'chat':
      if (responseData.response) return responseData.response;
      if (responseData.message) return responseData.message;
      if (responseData.reply) return responseData.reply;
      if (responseData.text) return responseData.text;
      if (responseData.ans) return responseData.ans;
      if (responseData.msg) return responseData.msg;
      if (responseData.content) return responseData.content;
      if (Array.isArray(responseData) && responseData.length > 0) {
        return responseData.map(item => {
          if (typeof item === 'string') return item;
          return item.response || item.message || item.text || JSON.stringify(item);
        }).join('\n');
      }
      break;

    case 'teach':
      if (responseData.message) return `✅ ${responseData.message}`;
      if (responseData.status) return `✅ ${responseData.status}`;
      if (responseData.success) return `✅ Successfully taught!`;
      break;

    case 'search':
      if (Array.isArray(responseData)) {
        let result = `\x1b[36m📋 Found ${responseData.length} results:\x1b[0m\n`;
        responseData.slice(0, 5).forEach((item, i) => {
          const title = item.title || item.name || item.videoTitle || 'Untitled';
          result += `\n  ${i+1}. \x1b[32m${title}\x1b[0m`;
          if (item.url) result += `\n     🔗 ${item.url}`;
          if (item.channel || item.author) result += `\n     📺 ${item.channel || item.author}`;
          if (item.duration) result += `\n     ⏱️ ${item.duration}`;
        });
        if (responseData.length > 5) {
          result += `\n\n  \x1b[33m... and ${responseData.length - 5} more results\x1b[0m`;
        }
        return result;
      }
      break;

    case 'download':
      const url = responseData.url || responseData.downloadUrl || responseData.link || responseData.videoUrl || responseData.ShAn;
      if (url) {
        let result = `\x1b[32m✅ Download URL:\x1b[0m\n🔗 ${url}`;
        if (responseData.title) result += `\n\n📝 Title: ${responseData.title}`;
        if (responseData.duration) result += `\n⏱️ Duration: ${responseData.duration}`;
        if (responseData.thumbnail) result += `\n🖼️ Thumbnail: ${responseData.thumbnail}`;
        if (responseData.quality) result += `\n📊 Quality: ${responseData.quality}`;
        return result;
      }
      break;

    case 'album':
      if (Array.isArray(responseData)) {
        let result = `\x1b[36m📂 Album contains ${responseData.length} items:\x1b[0m\n`;
        responseData.slice(0, 10).forEach((item, i) => {
          const title = item.title || item.name || item.videoTitle || 'Untitled';
          result += `\n  ${i+1}. \x1b[32m${title}\x1b[0m`;
          if (item.url) result += `\n     🔗 ${item.url}`;
          if (item.category) result += `\n     📁 ${item.category}`;
        });
        if (responseData.length > 10) {
          result += `\n\n  \x1b[33m... and ${responseData.length - 10} more items\x1b[0m`;
        }
        return result;
      }
      break;

    case 'list':
      if (Array.isArray(responseData)) {
        let result = `\x1b[36m📋 Total: ${responseData.length} items\x1b[0m\n`;
        responseData.slice(0, 10).forEach((item, i) => {
          if (typeof item === 'string') {
            result += `\n  ${i+1}. ${item}`;
          } else {
            const name = item.name || item.title || item.id || 'Item';
            result += `\n  ${i+1}. ${name}`;
          }
        });
        if (responseData.length > 10) {
          result += `\n\n  \x1b[33m... and ${responseData.length - 10} more\x1b[0m`;
        }
        return result;
      }
      break;
  }

  if (responseData.message) return responseData.message;
  if (responseData.status && responseData.message) {
    return `[${responseData.status}] ${responseData.message}`;
  }

  const keys = Object.keys(responseData);
  if (keys.length === 1 && typeof responseData[keys[0]] === 'string') {
    return responseData[keys[0]];
  }

  return JSON.stringify(responseData, null, 2);
}

// --------------------------------------------------------------
// URL PLATFORM DETECTOR
// --------------------------------------------------------------
function detectPlatform(url) {
  if (!url || typeof url !== 'string') return null;

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return { platform: 'YouTube', api: 'ShAnYtdl' };
  } else if (lowerUrl.includes('tiktok.com')) {
    return { platform: 'TikTok', api: 'ShAnTikdl' };
  } else if (lowerUrl.includes('instagram.com')) {
    return { platform: 'Instagram', api: 'ShAnInstadl' };
  } else if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com') || lowerUrl.includes('fb.watch')) {
    return { platform: 'Facebook', api: 'ShAnFbdl' };
  } else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return { platform: 'Twitter/X', api: 'ShAnTwitdl' };
  } else if (lowerUrl.includes('threads.com') || lowerUrl.includes('threads.net')) {
    return { platform: 'Threads', api: 'ShAnThreadl' };
  } else if (lowerUrl.includes('pin.it') || lowerUrl.includes('pinterest.com')) {
    return { platform: 'Pinterest', api: 'ShAnPindl' };
  } else if (lowerUrl.includes('capcut.com')) {
    return { platform: 'CapCut', api: 'ShAnCapcutdl' };
  } else if (lowerUrl.includes('likee.com') || lowerUrl.includes('likee.video') || lowerUrl.includes('l.likee.video')) {
    return { platform: 'Likee', api: 'ShAnLikeedl' };
  }

  return null;
}

// --------------------------------------------------------------
// DOWNLOAD MANAGER
// --------------------------------------------------------------
class DownloadManager {
  constructor() {
    this.downloadDir = CONFIG.downloadDir;
    this.history = [];
    this.activeControllers = new Set(); // AbortControllers for in-flight downloads
    this.createDownloadDir();
    this.loadHistory();
  }

  // Used by the SIGINT handler to cancel in-flight downloads cleanly
  abortAll() {
    for (const controller of this.activeControllers) {
      try { controller.abort(); } catch (e) {}
    }
  }

  async computeChecksum(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  createDownloadDir() {
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true });
    }
  }

  loadHistory() {
    const historyFile = path.join(this.downloadDir, 'history.json');
    if (fs.existsSync(historyFile)) {
      try {
        this.history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      } catch (e) {
        this.history = [];
      }
    }
  }

  saveHistory() {
    const historyFile = path.join(this.downloadDir, 'history.json');
    try {
      fs.writeFileSync(historyFile, JSON.stringify(this.history, null, 2));
    } catch (e) {}
  }

  // Strips query string / fragment before inspecting the extension,
  // and falls back sensibly when nothing usable is found.
  getFileExtension(url, fallback = '.mp4') {
    if (!url || typeof url !== 'string') return fallback;
    try {
      const parsedUrl = new URL(url);
      const ext = path.extname(parsedUrl.pathname);
      if (ext && ext.length <= 5) return ext;
      return fallback;
    } catch (e) {
      return fallback;
    }
  }

  getFileName(url, title, fallbackExt = '.mp4') {
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    const ext = this.getFileExtension(url, fallbackExt);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${cleanTitle || 'video'}_${timestamp}${ext}`;
  }

  async downloadFile(url, filePath, progressCallback) {
    const controller = new AbortController();
    this.activeControllers.add(controller);
    try {
      const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        },
        timeout: CONFIG.requestTimeoutMs,
        maxRedirects: 10,
        signal: controller.signal
      });

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      let startTime = Date.now();

      return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);

        response.data.on('data', (chunk) => {
          downloadedSize += chunk.length;
          if (progressCallback && totalSize) {
            const progress = (downloadedSize / totalSize) * 100;
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = elapsed > 0 ? downloadedSize / elapsed : 0;
            progressCallback(progress, totalSize, downloadedSize, speed);
          }
        });

        response.data.pipe(writer);

        writer.on('finish', () => {
          const elapsed = (Date.now() - startTime) / 1000;
          this.activeControllers.delete(controller);
          resolve({
            path: filePath,
            size: downloadedSize,
            totalSize: totalSize,
            time: elapsed,
            speed: elapsed > 0 ? downloadedSize / elapsed : 0
          });
        });

        writer.on('error', (err) => {
          try { fs.unlinkSync(filePath); } catch (e) {}
          this.activeControllers.delete(controller);
          reject(err);
        });

        response.data.on('error', (err) => {
          try { fs.unlinkSync(filePath); } catch (e) {}
          this.activeControllers.delete(controller);
          reject(err);
        });
      });
    } catch (error) {
      this.activeControllers.delete(controller);
      if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.message === 'canceled') {
        throw new Error('Download canceled');
      }
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  async downloadFromApi(apiFunction, url, author, title, platform, { showProgress = true } = {}) {
    try {
      if (!isValidHttpUrl(url)) {
        console.log('\x1b[31m❌ Invalid URL supplied.\x1b[0m');
        return { success: false, error: 'Invalid URL' };
      }

      console.log('\x1b[33m⏳ Fetching video info...\x1b[0m');
      const result = await withRetry(() => apiFunction(url, author), { label: `fetch info (${platform || 'unknown'})` });

      let downloadUrl = null;

      if (result && result.ShAn) {
        downloadUrl = result.ShAn;
      } else if (result && result.data && result.data.ShAn) {
        downloadUrl = result.data.ShAn;
      } else if (typeof result === 'string') {
        downloadUrl = result;
      } else if (result) {
        downloadUrl = result.url || result.downloadUrl || result.link || result.videoUrl;
      }

      if (!downloadUrl) {
        const data = extractResponseData(result);
        if (data) {
          downloadUrl = data.url || data.downloadUrl || data.link || data.videoUrl || data.ShAn;
        }
      }

      if (!downloadUrl) {
        console.log('\x1b[33m⚠️ No download URL found. Response:\x1b[0m');
        console.log(JSON.stringify(result, null, 2));
        return { success: false, error: 'No download URL found in API response' };
      }

      downloadUrl = String(downloadUrl).trim();

      if (!downloadUrl || downloadUrl === 'undefined' || downloadUrl === 'null' || !isValidHttpUrl(downloadUrl)) {
        console.log('\x1b[33m⚠️ Invalid download URL.\x1b[0m');
        return { success: false, error: 'Invalid download URL' };
      }

      const videoTitle = title || result?.title || 'video';
      const filename = this.getFileName(downloadUrl, videoTitle);
      const filePath = path.join(this.downloadDir, filename);

      console.log('\x1b[33m⏳ Downloading video...\x1b[0m');
      console.log(`📁 Saving to: ${filePath}`);

      const downloadResult = await this.downloadFile(downloadUrl, filePath, !showProgress ? null : (progress, total, downloaded, speed) => {
        const safeProgress = Number.isFinite(progress) ? progress : 0;
        const progressBar = this.createProgressBar(safeProgress);
        const sizeStr = total ? this.formatBytes(downloaded) : '?';
        const totalStr = total ? this.formatBytes(total) : '?';
        const speedStr = speed ? this.formatBytes(speed) + '/s' : '?';
        process.stdout.write(`\r${progressBar} ${safeProgress.toFixed(1)}% (${sizeStr}/${totalStr}) @ ${speedStr}`);
      });

      if (showProgress) console.log('\n');
      console.log('\x1b[32m✅ Download Complete!\x1b[0m');
      console.log(`📁 File saved: ${downloadResult.path}`);
      console.log(`📊 Size: ${this.formatBytes(downloadResult.size)}`);
      console.log(`⏱️ Time: ${downloadResult.time.toFixed(1)}s`);
      console.log(`⚡ Speed: ${this.formatBytes(downloadResult.speed)}/s`);

      let checksum = null;
      try {
        checksum = await this.computeChecksum(downloadResult.path);
        console.log(`🔒 SHA-256: ${checksum}`);
      } catch (e) {
        // Checksum is a nice-to-have, never fail the download over it
      }

      this.history.push({
        url: url,
        platform: platform || 'Unknown',
        title: videoTitle,
        filename: filename,
        size: downloadResult.size,
        time: downloadResult.time,
        checksum: checksum,
        downloadedAt: new Date().toISOString()
      });
      this.saveHistory();
      logEvent('info', `Downloaded ${filename} (${platform || 'Unknown'}, ${this.formatBytes(downloadResult.size)})`);

      return {
        success: true,
        filePath: downloadResult.path,
        filename: filename,
        size: downloadResult.size,
        checksum: checksum,
        metadata: result
      };
    } catch (error) {
      console.error('\x1b[31m❌ Download failed:\x1b[0m', error.message);
      logEvent('error', `Download failed for ${url}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  createProgressBar(percentage) {
    const clamped = Math.max(0, Math.min(100, Number.isFinite(percentage) ? percentage : 0));
    const barLength = 30;
    const filled = Math.floor((clamped / 100) * barLength);
    const empty = barLength - filled;
    return `\x1b[36m[${'█'.repeat(filled)}${'░'.repeat(empty)}]\x1b[0m`;
  }

  formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  listDownloads() {
    if (!fs.existsSync(this.downloadDir)) {
      return [];
    }
    return fs.readdirSync(this.downloadDir)
      .filter(file => file !== 'history.json')
      .map(file => ({
        name: file,
        path: path.join(this.downloadDir, file),
        size: fs.statSync(path.join(this.downloadDir, file)).size,
        created: fs.statSync(path.join(this.downloadDir, file)).birthtime
      }));
  }

  getDownloadStats() {
    const files = this.listDownloads();
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    return {
      count: files.length,
      totalSize: this.formatBytes(totalSize),
      history: this.history.slice(-10),
      files: files
    };
  }

  getHistoryStats() {
    const total = this.history.length;
    const totalSize = this.history.reduce((sum, h) => sum + (h.size || 0), 0);
    const platforms = {};
    this.history.forEach(h => {
      platforms[h.platform] = (platforms[h.platform] || 0) + 1;
    });
    return { total, totalSize: this.formatBytes(totalSize), platforms };
  }

  clearDownloads() {
    const files = this.listDownloads();
    for (const file of files) {
      try { fs.unlinkSync(file.path); } catch (e) {}
    }
    this.history = [];
    this.saveHistory();
    return files.length;
  }
}

const downloadManager = new DownloadManager();

// --------------------------------------------------------------
// AI TEACHING SESSION - Continuous Learning Mode
// --------------------------------------------------------------
class AITeachingSession {
  constructor(bot, api, author, uid, font) {
    this.bot = bot;
    this.api = api;
    this.author = author;
    this.uid = uid;
    this.font = font;
    this.questions = [];
    this.answers = [];
    this.sessionCount = 0;
    this.isActive = false;
  }

  async start() {
    this.isActive = true;
    this.sessionCount = 0;

    console.clear();
    console.log(`
\x1b[36m╔════════════════════════════════════════════════════════════╗\x1b[0m
\x1b[36m║     🤖 AI TEACHING SESSION - ${this.bot.toUpperCase()} BOT           ║\x1b[0m
\x1b[36m╚════════════════════════════════════════════════════════════╝\x1b[0m
\x1b[33m  🎯 Teach the AI by asking questions and providing answers!\x1b[0m
\x1b[33m  📝 Type your question, then provide the answer.\x1b[0m
\x1b[33m  🔄 Continue until you press \x1b[31mCtrl+C\x1b[0m\x1b[33m to exit.\x1b[0m
\x1b[33m  📊 Each session saves a pair (Question → Answer).\x1b[0m
\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
    `);

    console.log(`\x1b[90m  Author: ${this.author} | UID: ${this.uid} | Font: ${this.font}\x1b[0m\n`);

    await this.startTeachingCycle();
  }

  async startTeachingCycle() {
    while (this.isActive) {
      try {
        this.sessionCount++;
        console.log(`\x1b[36m┌─[ Session #${this.sessionCount} ]──────────────────────────────┐\x1b[0m`);

        const ask = await this.promptQuestion(`\x1b[32m❓ Enter your question:\x1b[0m`);
        if (!ask || ask.toLowerCase() === 'exit') {
          await this.endSession();
          return;
        }

        const ans = await this.promptQuestion(`\x1b[33m💡 Enter the answer:\x1b[0m`);
        if (!ans || ans.toLowerCase() === 'exit') {
          await this.endSession();
          return;
        }

        this.questions.push(ask);
        this.answers.push(ans);

        console.log(`\x1b[90m⏳ Teaching ${this.bot} bot...\x1b[0m`);

        let result;
        if (this.bot === 'baby') {
          result = await this.api.ShAnBteach(ask, ans, this.uid, this.font, this.author);
        } else {
          result = await this.api.ShAnHteach(ask, ans, this.uid, this.font, this.author);
        }

        const formatted = formatResponse(result, 'teach');
        console.log(`\x1b[32m✅ ${formatted}\x1b[0m`);
        console.log(`\x1b[90m  Q: ${ask.substring(0, 50)}${ask.length > 50 ? '...' : ''}\x1b[0m`);
        console.log(`\x1b[90m  A: ${ans.substring(0, 50)}${ans.length > 50 ? '...' : ''}\x1b[0m`);
        console.log(`\x1b[36m└────────────────────────────────────────────────────────────┘\x1b[0m\n`);

        const shouldContinue = await this.promptQuestion(`\x1b[36mContinue teaching? (y/n, or press Ctrl+C to exit)\x1b[0m`, 'y');
        if (shouldContinue.toLowerCase() !== 'y' && shouldContinue.toLowerCase() !== 'yes') {
          await this.endSession();
          return;
        }

      } catch (error) {
        if (error.message && (error.message.includes('canceled') || error.message.includes('exit'))) {
          await this.endSession();
          return;
        }
        console.error(`\x1b[31m❌ Error during teaching: ${error.message}\x1b[0m`);
        const retry = await this.promptQuestion(`\x1b[33mContinue or exit? (c/e)\x1b[0m`, 'c');
        if (retry.toLowerCase() === 'e') {
          await this.endSession();
          return;
        }
      }
    }
  }

  promptQuestion(question, defaultValue = '') {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const prompt = defaultValue ? `${question} \x1b[90m[${defaultValue}]\x1b[0m: ` : `${question}: `;
      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  async endSession() {
    this.isActive = false;
    console.log(`
\x1b[36m╔════════════════════════════════════════════════════════════╗\x1b[0m
\x1b[36m║          📊 TEACHING SESSION SUMMARY                       ║\x1b[0m
\x1b[36m╚════════════════════════════════════════════════════════════╝\x1b[0m
\x1b[32m  ✅ Total Lessons: ${this.sessionCount}\x1b[0m
\x1b[32m  📝 Questions: ${this.questions.length}\x1b[0m
\x1b[32m  💡 Answers: ${this.answers.length}\x1b[0m
\x1b[32m  🤖 Bot: ${this.bot.toUpperCase()}\x1b[0m
    `);

    if (this.questions.length > 0) {
      console.log(`\x1b[36m┌─ Last 3 Lessons ───────────────────────────────┐\x1b[0m`);
      const lastThree = this.questions.slice(-3);
      const lastThreeAns = this.answers.slice(-3);
      lastThree.forEach((q, i) => {
        console.log(`\x1b[90m  ${i + 1}. Q: ${q.substring(0, 40)}${q.length > 40 ? '...' : ''}\x1b[0m`);
        console.log(`\x1b[90m     A: ${lastThreeAns[i].substring(0, 40)}${lastThreeAns[i].length > 40 ? '...' : ''}\x1b[0m`);
      });
      console.log(`\x1b[36m└──────────────────────────────────────────────────┘\x1b[0m`);
    }

    console.log(`\n\x1b[33m🎯 AI has been taught successfully! You can now chat with it.\x1b[0m`);
    console.log(`\x1b[36m👋 Press Enter to return to main menu...\x1b[0m`);
    await this.promptQuestion('');
  }
}

// --------------------------------------------------------------
// BIG SHAN SERVER LOGO
// --------------------------------------------------------------
function showLogo() {
  const platform = getPlatform();
  const terminal = getTerminalType();
  const shell = getShell();
  const author = getDefaultAuthor();
  const stats = downloadManager.getDownloadStats();
  const historyStats = downloadManager.getHistoryStats();

  console.clear();
  console.log(`
\x1b[36m
   ███████╗██╗  ██╗ █████╗ ███╗   ██╗
   ██╔════╝██║  ██║██╔══██╗████╗  ██║
   ███████╗███████║███████║██╔██╗ ██║
   ╚════██║██╔══██║██╔══██║██║╚██╗██║
   ███████║██║  ██║██║  ██║██║ ╚████║
   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝

   ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗
   ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
   ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
   ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
   ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
   ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
\x1b[0m
\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
\x1b[36m              SHAN SERVER - v4.0.0 (Ultimate)\x1b[0m
\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
\x1b[90m  Platform: ${platform.padEnd(20)} Terminal: ${terminal}\x1b[0m
\x1b[90m  Shell: ${shell.padEnd(20)} API: ${CONFIG.apiBase.replace(/^https?:\/\//, '')}\x1b[0m
\x1b[90m  Default Author: ${author}\x1b[0m
\x1b[90m  📁 Downloads: ${stats.count} files | ${stats.totalSize}\x1b[0m
\x1b[90m  📊 History: ${historyStats.total} downloads | ${historyStats.totalSize}\x1b[0m
\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
  `);
}

// --------------------------------------------------------------
// API Configuration
// --------------------------------------------------------------
const Sh4n = CONFIG.apiBase;

const api = {
  ShAnAlldl: (url, author) => axios.get(`${Sh4n}ShAn-alldl?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnAlldl2: (url, author) => axios.get(`${Sh4n}ShAn-alldl2?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnFbdl: (url, author) => axios.get(`${Sh4n}ShAn-fbDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnYtdl: (url, author) => axios.get(`${Sh4n}ShAn-ytDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnYtmp3: (url, author) => axios.get(`${Sh4n}ShAn-ytmp3?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnThreadl: (url, author) => axios.get(`${Sh4n}ShAn-threaDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnTwitdl: (url, author) => axios.get(`${Sh4n}ShAn-twitDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnTikdl: (url, author) => axios.get(`${Sh4n}ShAn-tikDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnInstadl: (url, author) => axios.get(`${Sh4n}ShAn-instaDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnInstadl2: (url, author) => axios.get(`${Sh4n}ShAn-instaDL2?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnInstadl3: (url, author) => axios.get(`${Sh4n}ShAn-instaDL3?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnPindl: (url, author) => axios.get(`${Sh4n}ShAn-pinDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnCapcutdl: (url, author) => axios.get(`${Sh4n}ShAn-capcutDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnLikeedl: (url, author) => axios.get(`${Sh4n}ShAn-likeeDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnytSearch: (query, author) => axios.get(`${Sh4n}ShAn-ytsearch?query=${encodeURIComponent(query)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAntikSearch: (query, author) => axios.get(`${Sh4n}ShAn-tiksearch?query=${encodeURIComponent(query)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnBaby: (text, uid, font, author) => axios.get(`${Sh4n}ShAn-bby?text=${encodeURIComponent(text)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnBteach: (ask, ans, uid, font, author) => axios.get(`${Sh4n}ShAn-bteach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnBrans: (author) => axios.get(`${Sh4n}ShAn-brans?author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnBmsg: (ask, uid, font, author) => axios.get(`${Sh4n}ShAn-bmsg?ask=${encodeURIComponent(ask)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnBlist: (font, author) => axios.get(`${Sh4n}ShAn-blist?font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnBedit: (ask, newAsk, uid, font, author, index) => {
    let url = `${Sh4n}ShAn-bedit?ask=${encodeURIComponent(ask)}&newAsk=${encodeURIComponent(newAsk)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`;
    if (index) url += `&index=${encodeURIComponent(index)}`;
    return axios.get(url).then(res => res.data);
  },
  ShAnBdelete: (text, uid, font, author, index) => {
    let url = `${Sh4n}ShAn-bdelete?text=${encodeURIComponent(text)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`;
    if (index) url += `&index=${encodeURIComponent(index)}`;
    return axios.delete(url).then(res => res.data);
  },
  ShAnHoney: (text, uid, font, author) => axios.get(`${Sh4n}ShAn-honey?text=${encodeURIComponent(text)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnHteach: (ask, ans, uid, font, author) => axios.get(`${Sh4n}ShAn-hteach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnHmsg: (ask, uid, font, author) => axios.get(`${Sh4n}ShAn-hmsg?ask=${encodeURIComponent(ask)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnHlist: (font, author) => axios.get(`${Sh4n}ShAn-hlist?font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnHedit: (ask, newAsk, uid, font, author, index) => {
    let url = `${Sh4n}ShAn-hedit?ask=${encodeURIComponent(ask)}&newAsk=${encodeURIComponent(newAsk)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`;
    if (index) url += `&index=${encodeURIComponent(index)}`;
    return axios.get(url).then(res => res.data);
  },
  ShAnHdelete: (text, uid, font, author, index) => {
    let url = `${Sh4n}ShAn-hdelete?text=${encodeURIComponent(text)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`;
    if (index) url += `&index=${encodeURIComponent(index)}`;
    return axios.delete(url).then(res => res.data);
  },
  ShAnalbumVideos: (category, senderID, author, key) => axios.get(`${Sh4n}ShAn-album-videos?category=${category}&senderID=${senderID}&author=${encodeURIComponent(author)}&key=${encodeURIComponent(key)}`).then(res => res.data),
  ShAnalbumAdd: (category, videoUrl, senderID, author) => axios.post(`${Sh4n}ShAn-album-add?category=${category}&videoUrl=${encodeURIComponent(videoUrl)}&senderID=${senderID}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnalbumDelete: (url, author, key) => axios.delete(`${Sh4n}ShAn-album-delete?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}&key=${encodeURIComponent(key)}`).then(res => res.data),
  ShAnalbumList: (author) => axios.get(`${Sh4n}ShAn-album-list?author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnImgur: (videoUrl, author) => axios.post(`${Sh4n}ShAn-imgur?url=${encodeURIComponent(videoUrl)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnImgbb: (url, author) => axios.get(`${Sh4n}ShAn-imgbb?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnFont: (text, font, author) => axios.get(`${Sh4n}ShAn-font?text=${encodeURIComponent(text)}&font=${encodeURIComponent(font)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnfontList: (author) => axios.get(`${Sh4n}ShAn-fontList?author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnWish: (name, font, author) => axios.get(`${Sh4n}ShAn-wish?name=${encodeURIComponent(name)}&font=${encodeURIComponent(font)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAncaptionAdd: (category, language, caption, senderID, author) => axios.post(`${Sh4n}ShAn-caption-add?category=${encodeURIComponent(category)}&language=${encodeURIComponent(language)}&captain=${encodeURIComponent(caption)}&senderID=${encodeURIComponent(senderID)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAncaptionList: (language, author) => axios.get(`${Sh4n}ShAn-caption-list?language=${encodeURIComponent(language)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnCaption: (category, language, senderID, author, key) => axios.get(`${Sh4n}ShAn-caption?category=${encodeURIComponent(category)}&language=${encodeURIComponent(language)}&senderID=${encodeURIComponent(senderID)}&author=${encodeURIComponent(author)}&key=${encodeURIComponent(key)}`).then(res => res.data),
  ShAnmemeAdd: (memeUrl, senderID, author) => axios.post(`${Sh4n}ShAn-meme-add?memeUrl=${encodeURIComponent(memeUrl)}&senderID=${encodeURIComponent(senderID)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnMeme: (author) => axios.get(`${Sh4n}ShAn-meme?author=${encodeURIComponent(author)}`).then(res => res.data)
};

// Wrap every API function with automatic retry/backoff so transient network
// blips don't force the user to redo an entire menu flow.
for (const key of Object.keys(api)) {
  const original = api[key];
  api[key] = (...args) => withRetry(() => original(...args), { label: key });
}

// --------------------------------------------------------------
// PROMPT FUNCTIONS
// --------------------------------------------------------------
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

async function askQuestion(question, defaultValue = '') {
  const rl = createInterface();
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} \x1b[90m[${defaultValue}]\x1b[0m: ` : `${question}: `;
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function selectOption(question, options) {
  const rl = createInterface();
  console.log(`\n\x1b[36m${question}\x1b[0m`);
  options.forEach((opt, idx) => {
    console.log(`  ${idx + 1}. ${opt}`);
  });

  return new Promise((resolve) => {
    rl.question('\x1b[33mEnter number (or name): \x1b[0m', (answer) => {
      rl.close();
      const num = parseInt(answer);
      if (!isNaN(num) && num >= 1 && num <= options.length) {
        resolve(options[num - 1]);
      } else if (options.includes(answer)) {
        resolve(answer);
      } else {
        console.log('\x1b[31mInvalid selection, using default: ' + options[0] + '\x1b[0m');
        resolve(options[0]);
      }
    });
  });
}

// --------------------------------------------------------------
// Generic error-safe API call wrapper used by the simpler menus
// --------------------------------------------------------------
async function runSafely(actionFn) {
  try {
    await actionFn();
  } catch (err) {
    console.error('\x1b[31m❌ Error:\x1b[0m', err.response?.data || err.message);
  }
}

// --------------------------------------------------------------
// RANDOM TEACH MODE - ShAnBrans returns question, user provides answer
// --------------------------------------------------------------
async function randomTeachMode(bot, author, uid, font) {
  console.clear();
  showLogo();

  console.log(`
\x1b[36m╔════════════════════════════════════════════════════════════╗\x1b[0m
\x1b[36m║     🎯 RANDOM TEACH MODE - ${bot.toUpperCase()} BOT                ║\x1b[0m
\x1b[36m╚════════════════════════════════════════════════════════════╝\x1b[0m
\x1b[33m  🤖 AI gives a random question!\x1b[0m
\x1b[33m  💡 You provide the answer for that question!\x1b[0m
\x1b[33m  📝 This teaches the AI new responses!\x1b[0m
\x1b[33m  🔄 Type \x1b[31m"exit"\x1b[33m to stop teaching\x1b[0m
\x1b[33m  📊 Type \x1b[31m"skip"\x1b[33m to skip current question\x1b[0m
\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
  `);

  console.log(`\x1b[90m  Author: ${author} | UID: ${uid} | Font: ${font}\x1b[0m\n`);

  let teachingCount = 0;
  let continueTeaching = true;

  while (continueTeaching) {
    try {
      // Get random question from Baby
      const randomResult = await api.ShAnBrans(author);
      const randomQuestion = extractResponseData(randomResult);

      // Handle different response formats
      let questionText = '';
      if (typeof randomQuestion === 'string') {
        questionText = randomQuestion;
      } else if (randomQuestion) {
        questionText = randomQuestion.response || randomQuestion.message || randomQuestion.text || randomQuestion.ans || randomQuestion.msg || JSON.stringify(randomQuestion);
      } else {
        questionText = 'No question received';
      }

      console.log(`\x1b[36m┌─[ Teaching Session #${teachingCount + 1} ]────────────────────────────┐\x1b[0m`);
      console.log(`\x1b[32m🤖 ${bot} asks (random question):\x1b[0m ${questionText}`);

      const answer = await askQuestion(`\x1b[33m💡 Enter your answer (or type "exit" to stop):\x1b[0m`);

      // Check for exit
      if (!answer || answer.toLowerCase() === 'exit') {
        console.log(`\n\x1b[36m👋 Ending teaching session!\x1b[0m`);
        break;
      }

      // Check for skip
      if (answer.toLowerCase() === 'skip') {
        console.log(`\x1b[33m⏭️ Skipped this question!\x1b[0m`);
        console.log(`\x1b[36m└────────────────────────────────────────────────────────────────┘\x1b[0m\n`);
        continue;
      }

      console.log(`\x1b[90m⏳ Teaching ${bot} bot...\x1b[0m`);

      // Teach the bot with the question and answer
      let result;
      if (bot === 'Baby') {
        result = await api.ShAnBteach(questionText, answer, uid, font, author);
      } else {
        result = await api.ShAnHteach(questionText, answer, uid, font, author);
      }

      teachingCount++;
      const formatted = formatResponse(result, 'teach');

      console.log(`\x1b[32m✅ ${formatted || 'Successfully taught!'}\x1b[0m`);
      console.log(`\x1b[90m  Q: ${questionText.substring(0, 50)}${questionText.length > 50 ? '...' : ''}\x1b[0m`);
      console.log(`\x1b[90m  A: ${answer.substring(0, 50)}${answer.length > 50 ? '...' : ''}\x1b[0m`);
      console.log(`\x1b[36m└────────────────────────────────────────────────────────────────┘\x1b[0m\n`);

      // Show progress
      console.log(`\x1b[90m📊 Taught: ${teachingCount} responses\x1b[0m\n`);

    } catch (error) {
      console.error(`\x1b[31m❌ Error: ${error.message}\x1b[0m`);
      console.log(`\x1b[33m⏳ Continuing to next random question...\x1b[0m\n`);
    }
  }

  // Summary
  console.log(`
\x1b[36m╔════════════════════════════════════════════════════════════╗\x1b[0m
\x1b[36m║          📊 TEACHING SESSION SUMMARY                       ║\x1b[0m
\x1b[36m╚════════════════════════════════════════════════════════════╝\x1b[0m
\x1b[32m  ✅ Total Lessons: ${teachingCount}\x1b[0m
\x1b[32m  🤖 Bot: ${bot.toUpperCase()}\x1b[0m
\x1b[32m  👤 Author: ${author}\x1b[0m
  `);

  if (teachingCount > 0) {
    console.log(`\x1b[36m🎯 ${bot} has been taught ${teachingCount} new responses!\x1b[0m`);
  } else {
    console.log(`\x1b[33m⚠️ No new responses were taught.\x1b[0m`);
  }

  console.log(`\n\x1b[33m🎯 You can now chat with ${bot} and see the new responses!\x1b[0m`);
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

// --------------------------------------------------------------
// AI CHATBOT MENU
// --------------------------------------------------------------
async function aiChatbotMenu() {
  console.clear();
  showLogo();

  const bot = await selectOption('🤖 Select AI Chatbot:', ['Baby', 'Honey']);
  const action = await selectOption('Select Action:', [
    '💬 Chat',
    '📚 Teach (Continuous)',
    '🎯 Random Teach',
    '🎲 Random Response',
    '📋 List Data',
    '✏️ Edit',
    '🗑️ Delete'
  ]);

  const defaultAuthor = CONFIG.defaultAuthor || getDefaultAuthor();
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', defaultAuthor);
  const uid = await askQuestion('\x1b[36mEnter User ID (your unique identifier)\x1b[0m', CONFIG.defaultUid || 'user123');

  // Show available fonts
  console.log(`\n\x1b[36m🎨 Available Font Styles (1-5):\x1b[0m`);
  console.log(`  1. Bold      → 𝐄𝐱𝐚𝐦𝐩𝐥𝐞`);
  console.log(`  2. Script    → 𝓔𝔁𝓪𝓶𝓹𝓵𝓮`);
  console.log(`  3. Sans Serif → 𝘌𝘹𝘢𝘮𝘱𝘭𝘦`);
  console.log(`  4. Math Style → 𝔼𝕩𝕒𝕞𝕡𝕝𝕖`);
  console.log(`  5. Fraktur   → 𝔈𝔵𝔞𝔪𝔭𝔩𝔢`);

  const font = await askQuestion('\x1b[36mEnter Font number (1-5, default: 3)\x1b[0m', CONFIG.defaultFont || '3');
  savePersistedConfig({ defaultAuthor: author, defaultUid: uid, defaultFont: font });

  // Random Teach Mode
  if (action === 'Random Teach') {
    await randomTeachMode(bot, author, uid, font);
    return;
  }

  if (action === 'Teach (Continuous)') {
    const session = new AITeachingSession(bot.toLowerCase(), api, author, uid, font);
    const originalSigInt = process.listeners('SIGINT')[0];
    process.removeAllListeners('SIGINT');
    process.on('SIGINT', async () => {
      console.log('\n\x1b[33m\n⚠️ Teaching session interrupted!\x1b[0m');
      await session.endSession();
      process.exit(0);
    });
    await session.start();
    process.removeAllListeners('SIGINT');
    if (originalSigInt) process.on('SIGINT', originalSigInt);
    return;
  }

  try {
    let result;
    let formattedResponse;

    if (action === 'Chat') {
      let continueChatting = true;
      let messageCount = 0;

      console.log(`\n\x1b[36m💬 Starting chat with ${bot}...\x1b[0m`);
      console.log(`\x1b[33mType "exit" to end chat\x1b[0m\n`);

      while (continueChatting) {
        const text = await askQuestion(`\x1b[32m💬 You (${bot}):\x1b[0m`);

        if (!text) continue;

        if (text.toLowerCase() === 'exit') {
          console.log(`\n\x1b[36m👋 Ending chat with ${bot}. Goodbye!\x1b[0m`);
          break;
        }

        messageCount++;
        console.log(`\x1b[90m⏳ ${bot} is thinking...\x1b[0m`);

        if (bot === 'Baby') {
          result = await api.ShAnBaby(text, uid, font, author);
          formattedResponse = formatResponse(result, 'baby');
          console.log(`\n\x1b[36m👶 Baby:\x1b[0m ${formattedResponse}`);
        } else {
          result = await api.ShAnHoney(text, uid, font, author);
          formattedResponse = formatResponse(result, 'honey');
          console.log(`\n\x1b[33m🍯 Honey:\x1b[0m ${formattedResponse}`);
        }
        console.log(`\x1b[90m📝 Message ${messageCount}\x1b[0m\n`);
      }

      await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
      return;
    }

    else if (action === 'Random Response') {
      if (bot === 'Baby') {
        result = await api.ShAnBrans(author);
        formattedResponse = formatResponse(result, 'baby');
        console.log(`\n\x1b[36m🎲 Random Baby Response:\x1b[0m ${formattedResponse}`);
      } else {
        console.log('\x1b[33m⚠️ Random response only available for Baby bot\x1b[0m');
      }
    }

    else if (action === 'List Data') {
      if (bot === 'Baby') {
        result = await api.ShAnBlist(font, author);
        formattedResponse = formatResponse(result, 'list');
        console.log(`\n\x1b[36m📋 Baby Bot Data:\x1b[0m\n${formattedResponse}`);
      } else {
        result = await api.ShAnHlist(font, author);
        formattedResponse = formatResponse(result, 'list');
        console.log(`\n\x1b[36m📋 Honey Bot Data:\x1b[0m\n${formattedResponse}`);
      }
    }

    else if (action === 'Edit') {
      const ask = await askQuestion('\x1b[36mEnter the question to edit\x1b[0m');
      const newAsk = await askQuestion('\x1b[36mEnter the new question\x1b[0m');
      const index = await askQuestion('\x1b[36mEnter index (optional)\x1b[0m');

      if (bot === 'Baby') {
        result = await api.ShAnBedit(ask, newAsk, uid, font, author, index);
      } else {
        result = await api.ShAnHedit(ask, newAsk, uid, font, author, index);
      }
      const formatted = formatResponse(result, 'teach');
      console.log(`\n\x1b[32m✅ ${formatted || 'Successfully edited!'}\x1b[0m`);
    }

    else if (action === 'Delete') {
      const text = await askQuestion('\x1b[36mEnter text to delete\x1b[0m');
      const index = await askQuestion('\x1b[36mEnter index (optional)\x1b[0m');

      if (bot === 'Baby') {
        result = await api.ShAnBdelete(text, uid, font, author, index);
      } else {
        result = await api.ShAnHdelete(text, uid, font, author, index);
      }
      const formatted = formatResponse(result, 'teach');
      console.log(`\n\x1b[32m✅ ${formatted || 'Successfully deleted!'}\x1b[0m`);
    }

  } catch (err) {
    console.error('\x1b[31m❌ Error:\x1b[0m', err.response?.data || err.message);
  }

  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

// --------------------------------------------------------------
// BATCH DOWNLOAD
// --------------------------------------------------------------
async function batchDownloadMenu() {
  console.clear();
  showLogo();

  console.log(`\x1b[36m📋 BATCH DOWNLOAD MODE\x1b[0m`);
  console.log(`\x1b[33mEnter multiple URLs (one per line). Type "done" when finished.\x1b[0m\n`);

  const defaultAuthor = getDefaultAuthor();
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', defaultAuthor);

  const urls = [];
  console.log(`\n\x1b[36mEnter URLs (type "done" to finish):\x1b[0m`);

  while (true) {
    const url = await askQuestion(`\x1b[90mURL ${urls.length + 1}:\x1b[0m`);
    if (url.toLowerCase() === 'done' || url.toLowerCase() === 'exit') break;
    if (url.trim()) {
      if (!isValidHttpUrl(url.trim())) {
        console.log('\x1b[31m❌ That does not look like a valid URL, skipping.\x1b[0m');
        continue;
      }
      urls.push(url.trim());
    }
  }

  if (urls.length === 0) {
    console.log('\x1b[33m⚠️ No URLs entered.\x1b[0m');
    await askQuestion('\nPress Enter to continue...');
    return;
  }

  const concurrencyInput = await askQuestion(
    `\x1b[36mHow many downloads in parallel?\x1b[0m`,
    String(CONFIG.batchConcurrency)
  );
  const concurrency = Math.max(1, Math.min(10, parseInt(concurrencyInput, 10) || CONFIG.batchConcurrency));

  console.log(`\n\x1b[32m📥 Starting batch download of ${urls.length} videos (${concurrency} at a time)...\x1b[0m\n`);

  let successCount = 0;
  let failCount = 0;
  let completed = 0;

  await asyncPool(concurrency, urls, async (url, i) => {
    console.log(`\x1b[36m📥 [${i + 1}/${urls.length}] Processing:\x1b[0m ${url}`);

    const detected = detectPlatform(url);
    if (!detected) {
      console.log(`\x1b[31m❌ Unsupported platform for URL: ${url}\x1b[0m`);
      failCount++;
      completed++;
      return;
    }

    const apiFunction = api[detected.api];
    if (!apiFunction) {
      console.log(`\x1b[31m❌ API function not found for: ${detected.platform}\x1b[0m`);
      failCount++;
      completed++;
      return;
    }

    const result = await downloadManager.downloadFromApi(apiFunction, url, author, '', detected.platform, { showProgress: concurrency === 1 });
    completed++;
    if (result.success) {
      successCount++;
      console.log(`\x1b[90m📊 Progress: ${completed}/${urls.length} complete\x1b[0m`);
    } else {
      failCount++;
    }
  });

  console.log(`\n\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
  console.log(`\x1b[32m✅ Batch Download Complete!\x1b[0m`);
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  📁 Total: ${urls.length}`);

  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

// --------------------------------------------------------------
// DOWNLOAD MENU (Single)
// --------------------------------------------------------------
async function downloadMenu() {
  console.clear();
  showLogo();

  let continueDownloading = true;
  let author = null;
  let currentApiFunction = null;
  let currentPlatformName = '';
  let downloadCount = 0;

  while (continueDownloading) {
    if (!author) {
      const defaultAuthor = CONFIG.defaultAuthor || getDefaultAuthor();
      author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', defaultAuthor);
      savePersistedConfig({ defaultAuthor: author });
    }

    if (!currentApiFunction) {
      const platform = await selectOption('📥 Select Platform:', [
        'YouTube', 'TikTok', 'Instagram', 'Facebook', 'Twitter/X',
        'Threads', 'Pinterest', 'CapCut', 'Likee', 'All-in-One', 'Auto-Detect'
      ]);

      if (platform === 'Auto-Detect') {
        currentApiFunction = null;
        currentPlatformName = 'Auto-Detect';
      } else {
        switch(platform) {
          case 'YouTube': currentApiFunction = api.ShAnYtdl; currentPlatformName = 'YouTube'; break;
          case 'TikTok': currentApiFunction = api.ShAnTikdl; currentPlatformName = 'TikTok'; break;
          case 'Instagram': currentApiFunction = api.ShAnInstadl; currentPlatformName = 'Instagram'; break;
          case 'Facebook': currentApiFunction = api.ShAnFbdl; currentPlatformName = 'Facebook'; break;
          case 'Twitter/X': currentApiFunction = api.ShAnTwitdl; currentPlatformName = 'Twitter/X'; break;
          case 'Threads': currentApiFunction = api.ShAnThreadl; currentPlatformName = 'Threads'; break;
          case 'Pinterest': currentApiFunction = api.ShAnPindl; currentPlatformName = 'Pinterest'; break;
          case 'CapCut': currentApiFunction = api.ShAnCapcutdl; currentPlatformName = 'CapCut'; break;
          case 'Likee': currentApiFunction = api.ShAnLikeedl; currentPlatformName = 'Likee'; break;
          case 'All-in-One': currentApiFunction = api.ShAnAlldl; currentPlatformName = 'All-in-One'; break;
        }
      }
    }

    const url = await askQuestion('\x1b[36mEnter video URL\x1b[0m');
    if (!url) {
      console.log('\x1b[31m❌ URL is required!\x1b[0m');
      continue;
    }
    if (!isValidHttpUrl(url)) {
      console.log('\x1b[31m❌ That does not look like a valid URL!\x1b[0m');
      continue;
    }

    let apiFunction = currentApiFunction;
    let platformName = currentPlatformName;

    if (currentPlatformName === 'Auto-Detect' || !currentApiFunction) {
      const detected = detectPlatform(url);
      if (detected) {
        apiFunction = api[detected.api];
        platformName = detected.platform;
        console.log(`\x1b[90m🔍 Detected: ${platformName}\x1b[0m`);
      } else {
        console.log('\x1b[31m❌ Could not detect platform. Please select manually.\x1b[0m');
        continue;
      }
    }

    const customTitle = await askQuestion('\x1b[36mEnter custom title (optional)\x1b[0m');
    const shouldDownload = await askQuestion('\x1b[33mDownload and save to device? (y/n)\x1b[0m', 'y');

    if (shouldDownload.toLowerCase() === 'y' || shouldDownload.toLowerCase() === 'yes') {
      downloadCount++;
      const result = await downloadManager.downloadFromApi(apiFunction, url, author, customTitle, platformName);
      if (result.success) {
        console.log('\n\x1b[32m✅ Video saved successfully!\x1b[0m');
        console.log(`📁 Location: ${result.filePath}`);

        const stats = downloadManager.getDownloadStats();
        console.log(`\n\x1b[36m📊 Download Statistics:\x1b[0m`);
        console.log(`  Downloads in session: ${downloadCount}`);
        console.log(`  Total Files: ${stats.count}`);
        console.log(`  Total Size: ${stats.totalSize}`);
      }
    } else {
      console.log(`\n\x1b[33m⏳ Fetching ${platformName} video info...\x1b[0m`);
      await runSafely(async () => {
        const result = await apiFunction(url, author);
        const formatted = formatResponse(result, 'download');
        console.log(`\n\x1b[32m✅ ${platformName} Video Info:\x1b[0m\n${formatted}`);
      });
    }

    console.log(`\n\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
    console.log(`\x1b[33m📌 Options:\x1b[0m`);
    console.log(`  \x1b[32m1.\x1b[0m Press \x1b[36mEnter\x1b[0m to return to Main Menu`);
    console.log(`  \x1b[32m2.\x1b[0m Enter a new \x1b[36mURL\x1b[0m to download more videos`);
    console.log(`  \x1b[32m3.\x1b[0m Type \x1b[31m"exit"\x1b[0m to quit`);
    console.log(`  \x1b[32m4.\x1b[0m Type \x1b[33m"change"\x1b[0m to change platform`);
    console.log(`  \x1b[32m5.\x1b[0m Type \x1b[33m"author"\x1b[0m to change author name`);
    console.log(`  \x1b[32m6.\x1b[0m Type \x1b[33m"stats"\x1b[0m to show download stats`);
    console.log(`\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);

    const nextAction = await askQuestion(`\x1b[36mEnter URL, press Enter for Main Menu, or type a command\x1b[0m`);

    if (nextAction.toLowerCase() === 'exit') {
      console.log('\n\x1b[36m👋 Goodbye!\x1b[0m');
      process.exit(0);
    }

    if (nextAction.toLowerCase() === 'change') {
      currentApiFunction = null;
      currentPlatformName = '';
      console.log('\n\x1b[33m🔄 Platform changed. Select new platform...\x1b[0m');
      continue;
    }

    if (nextAction.toLowerCase() === 'author') {
      author = null;
      console.log('\n\x1b[33m👤 Author changed. Enter new author...\x1b[0m');
      continue;
    }

    if (nextAction.toLowerCase() === 'stats') {
      const stats = downloadManager.getDownloadStats();
      console.log(`\n\x1b[36m📊 Download Statistics:\x1b[0m`);
      console.log(`  Total Files: ${stats.count}`);
      console.log(`  Total Size: ${stats.totalSize}`);
      console.log(`  Downloads in session: ${downloadCount}`);
      continue;
    }

    if (nextAction && nextAction.trim() !== '') {
      if (isValidHttpUrl(nextAction.trim())) {
        const detected = detectPlatform(nextAction);
        if (detected) {
          const result = await downloadManager.downloadFromApi(api[detected.api], nextAction.trim(), author, '', detected.platform);
          if (result.success) {
            downloadCount++;
            console.log('\n\x1b[32m✅ Video saved successfully!\x1b[0m');
            console.log(`📁 Location: ${result.filePath}`);

            const stats = downloadManager.getDownloadStats();
            console.log(`\n\x1b[36m📊 Download Statistics:\x1b[0m`);
            console.log(`  Downloads in session: ${downloadCount}`);
            console.log(`  Total Files: ${stats.count}`);
            console.log(`  Total Size: ${stats.totalSize}`);
          }
          continue;
        }
      }
      console.log('\x1b[33m⚠️ Invalid input. Returning to Main Menu...\x1b[0m');
      await askQuestion('\nPress Enter to continue...');
      return;
    } else {
      console.log('\n\x1b[36m↩️ Returning to Main Menu...\x1b[0m');
      await askQuestion('\nPress Enter to continue...');
      return;
    }
  }
}

// --------------------------------------------------------------
// HISTORY MENU
// --------------------------------------------------------------
async function historyMenu() {
  console.clear();
  showLogo();

  const historyStats = downloadManager.getHistoryStats();
  console.log(`\n\x1b[36m📊 Download History\x1b[0m`);
  console.log(`\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
  console.log(`  Total Downloads: ${historyStats.total}`);
  console.log(`  Total Size: ${historyStats.totalSize}`);
  console.log(`\n  \x1b[36mPlatforms:\x1b[0m`);
  for (const [platform, count] of Object.entries(historyStats.platforms)) {
    console.log(`    • ${platform}: ${count}`);
  }

  const history = downloadManager.history.slice(-10).reverse();
  if (history.length > 0) {
    console.log(`\n\x1b[36m📋 Last 10 Downloads:\x1b[0m`);
    history.forEach((item, i) => {
      console.log(`  ${i + 1}. \x1b[32m${item.title || 'Untitled'}\x1b[0m`);
      console.log(`     📁 ${item.filename}`);
      console.log(`     📊 ${downloadManager.formatBytes(item.size || 0)}`);
      console.log(`     ⏱️ ${item.time ? item.time.toFixed(1) + 's' : 'N/A'}`);
      console.log(`     📅 ${new Date(item.downloadedAt).toLocaleString()}`);
    });
  } else {
    console.log('\n\x1b[33m⚠️ No download history yet.\x1b[0m');
  }

  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

// --------------------------------------------------------------
// SEARCH MENU
// --------------------------------------------------------------
async function searchMenu() {
  console.clear();
  showLogo();
  const platform = await selectOption('🔍 Search On:', ['YouTube', 'TikTok']);
  const query = await askQuestion('\x1b[36mEnter search query\x1b[0m');
  if (!query) { console.log('\x1b[31m❌ Query is required!\x1b[0m'); await askQuestion('\nPress Enter to continue...'); return; }
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', getDefaultAuthor());
  console.log(`\n\x1b[33m⏳ Searching ${platform} for "${query}"...\x1b[0m\n`);
  await runSafely(async () => {
    const result = platform === 'YouTube' ? await api.ShAnytSearch(query, author) : await api.ShAntikSearch(query, author);
    const formatted = formatResponse(result, 'search');
    console.log(`\x1b[32m✅ Search Results:\x1b[0m\n${formatted}`);
  });
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

// --------------------------------------------------------------
// ALBUM MENU
// --------------------------------------------------------------
async function albumMenu() {
  console.clear();
  showLogo();
  const action = await selectOption('💾 Album Actions:', ['List Albums', 'Add Video', 'View Videos', 'Delete Video']);
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', getDefaultAuthor());
  await runSafely(async () => {
    let result, formatted;
    if (action === 'List Albums') {
      result = await api.ShAnalbumList(author);
      formatted = formatResponse(result, 'album');
      console.log(`\n\x1b[32m✅ Albums:\x1b[0m\n${formatted}`);
    } else if (action === 'Add Video') {
      const category = await askQuestion('\x1b[36mEnter category name\x1b[0m');
      const videoUrl = await askQuestion('\x1b[36mEnter video URL\x1b[0m');
      const senderID = await askQuestion('\x1b[36mEnter sender ID\x1b[0m');
      result = await api.ShAnalbumAdd(category, videoUrl, senderID, author);
      const formattedMsg = formatResponse(result, 'teach');
      console.log(`\n\x1b[32m✅ ${formattedMsg || `Video added to "${category}" album!`}\x1b[0m`);
    } else if (action === 'View Videos') {
      const category = await askQuestion('\x1b[36mEnter category name\x1b[0m');
      const senderID = await askQuestion('\x1b[36mEnter sender ID\x1b[0m');
      const key = await askQuestion('\x1b[36mEnter access key (optional)\x1b[0m');
      result = await api.ShAnalbumVideos(category, senderID, author, key);
      formatted = formatResponse(result, 'album');
      console.log(`\n\x1b[32m✅ Videos in "${category}":\x1b[0m\n${formatted}`);
    } else if (action === 'Delete Video') {
      const url = await askQuestion('\x1b[36mEnter video URL to delete\x1b[0m');
      const key = await askQuestion('\x1b[36mEnter access key\x1b[0m');
      result = await api.ShAnalbumDelete(url, author, key);
      const formattedMsg = formatResponse(result, 'teach');
      console.log(`\n\x1b[32m✅ ${formattedMsg || 'Video deleted successfully!'}\x1b[0m`);
    }
  });
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

// --------------------------------------------------------------
// FONT MENU
// --------------------------------------------------------------
async function fontMenu() {
  console.clear();
  showLogo();
  const action = await selectOption('🎨 Font Utilities:', ['Apply Font to Text', 'List Available Fonts', 'Generate Wish Card']);
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', getDefaultAuthor());
  await runSafely(async () => {
    if (action === 'List Available Fonts') {
      const result = await api.ShAnfontList(author);
      const formatted = formatResponse(result, 'list');
      console.log(`\n\x1b[32m✅ Available Fonts:\x1b[0m\n${formatted}`);
    } else if (action === 'Apply Font to Text') {
      const text = await askQuestion('\x1b[36mEnter your text\x1b[0m');
      const font = await askQuestion('\x1b[36mEnter font name\x1b[0m', 'Arial');
      const result = await api.ShAnFont(text, font, author);
      const formatted = formatResponse(result, 'chat');
      console.log(`\n\x1b[32m✅ Formatted Text:\x1b[0m\n${formatted}`);
    } else if (action === 'Generate Wish Card') {
      const name = await askQuestion('\x1b[36mEnter name for wish card\x1b[0m');
      const font = await askQuestion('\x1b[36mEnter font name\x1b[0m', 'Arial');
      const result = await api.ShAnWish(name, font, author);
      const data = extractResponseData(result);
      console.log(`\n\x1b[32m✅ Wish Card Generated:\x1b[0m`);
      console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    }
  });
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

// --------------------------------------------------------------
// CAPTION MENU
// --------------------------------------------------------------
async function captionMenu() {
  console.clear();
  showLogo();
  const action = await selectOption('📝 Caption Manager:', ['Add Caption', 'Get Caption', 'List Captions']);
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', getDefaultAuthor());
  await runSafely(async () => {
    if (action === 'Add Caption') {
      const category = await askQuestion('\x1b[36mEnter category\x1b[0m');
      const language = await askQuestion('\x1b[36mEnter language (e.g., en, es, hi)\x1b[0m');
      const caption = await askQuestion('\x1b[36mEnter caption text\x1b[0m');
      const senderID = await askQuestion('\x1b[36mEnter sender ID\x1b[0m');
      const result = await api.ShAncaptionAdd(category, language, caption, senderID, author);
      const formatted = formatResponse(result, 'teach');
      console.log(`\n\x1b[32m✅ ${formatted || 'Caption added successfully!'}\x1b[0m`);
    } else if (action === 'List Captions') {
      const language = await askQuestion('\x1b[36mEnter language\x1b[0m', 'en');
      const result = await api.ShAncaptionList(language, author);
      const formatted = formatResponse(result, 'list');
      console.log(`\n\x1b[32m✅ Captions List:\x1b[0m\n${formatted}`);
    } else if (action === 'Get Caption') {
      const category = await askQuestion('\x1b[36mEnter category\x1b[0m');
      const language = await askQuestion('\x1b[36mEnter language\x1b[0m');
      const senderID = await askQuestion('\x1b[36mEnter sender ID\x1b[0m');
      const key = await askQuestion('\x1b[36mEnter access key (optional)\x1b[0m');
      const result = await api.ShAnCaption(category, language, senderID, author, key);
      const data = extractResponseData(result);
      console.log(`\n\x1b[32m✅ Caption:\x1b[0m`);
      console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    }
  });
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

// --------------------------------------------------------------
// MEME MENU
// --------------------------------------------------------------
async function memeMenu() {
  console.clear();
  showLogo();
  const action = await selectOption('🖼️ Meme Generator:', ['Get Random Meme', 'Add New Meme']);
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', getDefaultAuthor());
  await runSafely(async () => {
    if (action === 'Get Random Meme') {
      const result = await api.ShAnMeme(author);
      const data = extractResponseData(result);
      console.log(`\n\x1b[32m✅ Random Meme:\x1b[0m`);
      if (typeof data === 'string') console.log(data);
      else if (data) {
        if (data.url) console.log(`🖼️ ${data.url}`);
        if (data.title) console.log(`📝 ${data.title}`);
        if (data.text) console.log(`💬 ${data.text}`);
        if (data.image) console.log(`🖼️ ${data.image}`);
        console.log(JSON.stringify(data, null, 2));
      }
    } else if (action === 'Add New Meme') {
      const memeUrl = await askQuestion('\x1b[36mEnter meme image/video URL\x1b[0m');
      const senderID = await askQuestion('\x1b[36mEnter sender ID\x1b[0m');
      const result = await api.ShAnmemeAdd(memeUrl, senderID, author);
      const formatted = formatResponse(result, 'teach');
      console.log(`\n\x1b[32m✅ ${formatted || 'Meme added successfully!'}\x1b[0m`);
    }
  });
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

// --------------------------------------------------------------
// CLOUD MENU
// --------------------------------------------------------------
async function cloudMenu() {
  console.clear();
  showLogo();
  const platform = await selectOption('☁️ Upload To:', ['Imgur', 'ImgBB']);
  const url = await askQuestion('\x1b[36mEnter media URL to upload\x1b[0m');
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', getDefaultAuthor());
  if (!url || !isValidHttpUrl(url)) { console.log('\x1b[31m❌ A valid URL is required!\x1b[0m'); await askQuestion('\nPress Enter to continue...'); return; }
  console.log(`\n\x1b[33m⏳ Uploading to ${platform}...\x1b[0m\n`);
  await runSafely(async () => {
    const result = platform === 'Imgur' ? await api.ShAnImgur(url, author) : await api.ShAnImgbb(url, author);
    const data = extractResponseData(result);
    console.log(`\x1b[32m✅ Upload Successful!\x1b[0m`);
    if (typeof data === 'string') console.log(data);
    else if (data) {
      if (data.url) console.log(`🔗 URL: ${data.url}`);
      if (data.deleteHash) console.log(`🗑️ Delete Hash: ${data.deleteHash}`);
      if (data.link) console.log(`🔗 Link: ${data.link}`);
      console.log(JSON.stringify(data, null, 2));
    }
  });
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

// --------------------------------------------------------------
// MANAGE DOWNLOADS MENU
// --------------------------------------------------------------
async function manageDownloadsMenu() {
  console.clear();
  showLogo();
  const stats = downloadManager.getDownloadStats();
  console.log(`\n\x1b[36m📁 Download Statistics:\x1b[0m`);
  console.log(`  Total Files: ${stats.count}`);
  console.log(`  Total Size: ${stats.totalSize}`);
  console.log(`  Location: ${downloadManager.downloadDir}`);
  if (stats.count > 0) {
    console.log(`\n\x1b[36m📋 Recent Downloads:\x1b[0m`);
    const files = downloadManager.listDownloads().slice(0, 10);
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name} (${downloadManager.formatBytes(file.size)})`);
    });
    const action = await selectOption('\n📂 Actions:', ['Open Downloads Folder', 'Clear All Downloads', 'Back to Main Menu']);
    if (action === 'Open Downloads Folder') {
      const open = require('child_process');
      const platform = os.platform();
      let command;
      if (platform === 'win32') command = `start "" "${downloadManager.downloadDir}"`;
      else if (platform === 'darwin') command = `open "${downloadManager.downloadDir}"`;
      else command = `xdg-open "${downloadManager.downloadDir}"`;
      open.exec(command, (err) => {
        if (err) console.log('\x1b[33m⚠️ Could not open folder automatically\x1b[0m');
        console.log(`📁 Downloads folder: ${downloadManager.downloadDir}`);
      });
    } else if (action === 'Clear All Downloads') {
      const confirm = await askQuestion('\x1b[31m⚠️ Delete all downloaded files? (y/n)\x1b[0m', 'n');
      if (confirm.toLowerCase() === 'y') {
        const count = downloadManager.clearDownloads();
        console.log(`\x1b[32m✅ Deleted ${count} files\x1b[0m`);
      }
    }
  } else {
    console.log('\n\x1b[33m⚠️ No downloads found.\x1b[0m');
    await askQuestion('\nPress Enter to continue...');
  }
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

// --------------------------------------------------------------
// MAIN MENU
// --------------------------------------------------------------
async function showMainMenu() {
  showLogo();

  console.log(`
\x1b[36m┌─────────────────────────────────────────────────────────┐\x1b[0m
\x1b[36m│                    📋 MAIN MENU                         │\x1b[0m
\x1b[36m├─────────────────────────────────────────────────────────┤\x1b[0m
\x1b[32m│  1. 📥 Download & Save Videos                           │\x1b[0m
\x1b[32m│  2. 📦 Batch Download (Multiple URLs)                   │\x1b[0m
\x1b[32m│  3. 📂 Manage Downloads                                 │\x1b[0m
\x1b[32m│  4. 📊 Download History                                 │\x1b[0m
\x1b[32m│  5. 🔍 Search Content                                   │\x1b[0m
\x1b[32m│  6. 🤖 AI Chatbots (Baby/Honey)                         │\x1b[0m
\x1b[32m│  7. 💾 Album Management                                 │\x1b[0m
\x1b[32m│  8. 🎨 Font & Text Utilities                            │\x1b[0m
\x1b[32m│  9. 📝 Caption Manager                                  │\x1b[0m
\x1b[32m│ 10. 🖼️  Meme Generator                                  │\x1b[0m
\x1b[32m│ 11. ☁️  Cloud Upload (Imgur/ImgBB)                      │\x1b[0m
\x1b[31m│  0. ❌ Exit                                              │\x1b[0m
\x1b[36m└─────────────────────────────────────────────────────────┘\x1b[0m
  `);

  const choice = await askQuestion('\x1b[36mSelect an option\x1b[0m', '0');
  return choice;
}

// --------------------------------------------------------------
// MAIN PROGRAM
// --------------------------------------------------------------
async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showLogo();
    console.log(`
\x1b[36mSHAN SERVER - Ultimate Media Downloader & Utilities v4.0\x1b[0m

\x1b[33mUSAGE:\x1b[0m
  shan              Start interactive menu
  shan --help       Show this help
  shan --version    Show version

\x1b[33mENV VARS:\x1b[0m
  SHAN_API_BASE        Override the backend API base URL
  SHAN_DOWNLOAD_DIR    Override where downloads are saved
  SHAN_TIMEOUT_MS      Override the download request timeout
  SHAN_CONCURRENCY     Default parallel downloads for batch mode (default: 3)
  SHAN_RETRIES         Retry attempts for flaky API/network calls (default: 2)
  SHAN_RETRY_DELAY_MS  Base backoff delay between retries (default: 400)

  Your author/UID/font choices and these settings also persist between runs in
  ~/.shan-server/config.json, so you won't need to re-enter them every time.

\x1b[33mFEATURES:\x1b[0m
  ✓ Download videos from 10+ platforms
  ✓ Parallel batch download with configurable concurrency
  ✓ Automatic retry with exponential backoff on network hiccups
  ✓ SHA-256 checksum verification after every download
  ✓ Graceful Ctrl+C: cancels in-flight downloads and cleans up partial files
  ✓ Persisted preferences (author, UID, font, concurrency) across sessions
  ✓ Activity log file for auditing downloads/errors
  ✓ Auto-detect platform from URL
  ✓ Download history with stats
  ✓ Save directly to device with speed indicator
  ✓ Continuous download loop
  ✓ Change platform & author without restarting
  ✓ Random Teach Mode - AI asks questions, you provide answers
  ✓ Continuous AI Teaching Mode (Ctrl+C to exit)
  ✓ Beautiful chat-style responses
  ✓ AI Chatbots (Baby/Honey)
  ✓ Album Management
  ✓ Font Styling
  ✓ Caption Manager
  ✓ Meme Generator
  ✓ Cloud Upload

\x1b[33mRANDOM TEACH MODE:\x1b[0m
  • AI gives a random question using ShAnBrans
  • You provide the answer
  • AI learns automatically
  • Type "exit" to stop
  • Type "skip" to skip current question

\x1b[33mEXAMPLES:\x1b[0m
  $ shan                    # Start interactive menu
  $ npx shan-server         # Run without installing

\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
    `);
    process.exit(0);
  }

  if (process.argv.includes('--version') || process.argv.includes('-v')) {
    console.log('shan-server v4.0.0 (Ultimate)');
    console.log(`Default Author (CLI): ${getDefaultAuthor()}`);
    console.log(`Downloads Folder: ${downloadManager.downloadDir}`);
    const stats = downloadManager.getDownloadStats();
    console.log(`Downloads: ${stats.count} files | ${stats.totalSize}`);
    process.exit(0);
  }

  while (true) {
    const choice = await showMainMenu();
    switch(choice) {
      case '1': await downloadMenu(); break;
      case '2': await batchDownloadMenu(); break;
      case '3': await manageDownloadsMenu(); break;
      case '4': await historyMenu(); break;
      case '5': await searchMenu(); break;
      case '6': await aiChatbotMenu(); break;
      case '7': await albumMenu(); break;
      case '8': await fontMenu(); break;
      case '9': await captionMenu(); break;
      case '10': await memeMenu(); break;
      case '11': await cloudMenu(); break;
      case '0':
        console.log('\n\x1b[36m👋 Thank you for using SHAN SERVER!\x1b[0m\n');
        console.log(`📁 Downloads saved in: ${downloadManager.downloadDir}`);
        process.exit(0);
      default:
        console.log('\x1b[31m❌ Invalid option! Please try again.\x1b[0m');
        await askQuestion('\nPress Enter to continue...');
    }
  }
}

process.on('SIGINT', () => {
  if (downloadManager.activeControllers.size > 0) {
    console.log(`\n\n\x1b[33m⚠️ Canceling ${downloadManager.activeControllers.size} in-progress download(s)...\x1b[0m`);
    downloadManager.abortAll();
  }
  console.log('\n\x1b[36m👋 Goodbye from SHAN SERVER!\x1b[0m\n');
  console.log(`📁 Downloads saved in: ${downloadManager.downloadDir}`);
  logEvent('info', 'Session ended via SIGINT');
  // Give in-flight cleanup handlers (unlink of partial files) a brief moment to run
  setTimeout(() => process.exit(0), 150);
});

if (require.main === module) {
  main().catch(console.error);
}

// --------------------------------------------------------------
// EXPORT
// --------------------------------------------------------------
module.exports = {
  ShAnAlldl: api.ShAnAlldl,
  ShAnAlldl2: api.ShAnAlldl2,
  ShAnFbdl: api.ShAnFbdl,
  ShAnYtdl: api.ShAnYtdl,
  ShAnYtmp3: api.ShAnYtmp3,
  ShAnThreadl: api.ShAnThreadl,
  ShAnTwitdl: api.ShAnTwitdl,
  ShAnTikdl: api.ShAnTikdl,
  ShAnInstadl: api.ShAnInstadl,
  ShAnInstadl2: api.ShAnInstadl2,
  ShAnInstadl3: api.ShAnInstadl3,
  ShAnPindl: api.ShAnPindl,
  ShAnCapcutdl: api.ShAnCapcutdl,
  ShAnLikeedl: api.ShAnLikeedl,
  ShAnytSearch: api.ShAnytSearch,
  ShAntikSearch: api.ShAntikSearch,
  ShAnBaby: api.ShAnBaby,
  ShAnBteach: api.ShAnBteach,
  ShAnBrans: api.ShAnBrans,
  ShAnBmsg: api.ShAnBmsg,
  ShAnBlist: api.ShAnBlist,
  ShAnBedit: api.ShAnBedit,
  ShAnBdelete: api.ShAnBdelete,
  ShAnHoney: api.ShAnHoney,
  ShAnHteach: api.ShAnHteach,
  ShAnHmsg: api.ShAnHmsg,
  ShAnHlist: api.ShAnHlist,
  ShAnHedit: api.ShAnHedit,
  ShAnHdelete: api.ShAnHdelete,
  ShAnalbumVideos: api.ShAnalbumVideos,
  ShAnalbumAdd: api.ShAnalbumAdd,
  ShAnalbumDelete: api.ShAnalbumDelete,
  ShAnalbumList: api.ShAnalbumList,
  ShAnImgur: api.ShAnImgur,
  ShAnImgbb: api.ShAnImgbb,
  ShAnFont: api.ShAnFont,
  ShAnfontList: api.ShAnfontList,
  ShAnWish: api.ShAnWish,
  ShAncaptionAdd: api.ShAncaptionAdd,
  ShAncaptionList: api.ShAncaptionList,
  ShAnCaption: api.ShAnCaption,
  ShAnmemeAdd: api.ShAnmemeAdd,
  ShAnMeme: api.ShAnMeme,
  downloadManager,
  AITeachingSession,
  getDefaultAuthor,
  detectPlatform,
  isValidHttpUrl,
  withRetry,
  asyncPool,
  logEvent,
  loadPersistedConfig,
  savePersistedConfig,
  CONFIG
};
