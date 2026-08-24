const axios = require('axios');
const readline = require('readline');
const os = require('os');

function getDefaultAuthor() {
  try {
    const username = os.userInfo().username;
    if (username && username !== 'root' && username !== 'admin') {
      return username;
    }
  } catch (e) {
  }

  const envUser = process.env.USER || process.env.USERNAME || process.env.LOGNAME;
  if (envUser && envUser !== 'root' && envUser !== 'admin') {
    return envUser;
  }

  return '♡︎ 𝗦𝗵𝗔𝗻 ♡︎';
}

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

function showLogo() {
  const platform = getPlatform();
  const terminal = getTerminalType();
  const shell = getShell();
  const author = getDefaultAuthor();
  
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
\x1b[36m              SHAN SERVER - v1.0.0\x1b[0m
\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
\x1b[90m  Platform: ${platform.padEnd(20)} Terminal: ${terminal}\x1b[0m
\x1b[90m  Shell: ${shell.padEnd(20)} API: sh-ans-api-07.vercel.app\x1b[0m
\x1b[90m  Default Author: ${author}\x1b[0m
\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
  `);
}

const Sh4n = 'https://sh-ans-api-07.vercel.app/';

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
  ShAnBaby: (text, uid, font, author) => axios.get(`${Sh4n}ShAn-bby?text=${encodeURIComponent(text)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnBteach: (ask, ans, uid, font, author) => axios.get(`${Sh4n}ShAn-bteach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnBrans: (author) => axios.get(`${Sh4n}ShAn-brans?author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnBmsg: (ask, uid, font, author) => axios.get(`${Sh4n}ShAn-bmsg?ask=${encodeURIComponent(ask)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnBlist: (font, author) => axios.get(`${Sh4n}ShAn-blist?font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnBedit: (ask, newAsk, uid, font, author, index) => {
    let url = `${Sh4n}ShAn-bedit?ask=${encodeURIComponent(ask)}&newAsk=${encodeURIComponent(newAsk)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`;
    if (index) url += `&index=${index}`;
    return axios.get(url).then(res => res.data);
  },
  ShAnBdelete: (text, uid, font, author, index) => {
    let url = `${Sh4n}ShAn-bdelete?text=${encodeURIComponent(text)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`;
    if (index) url += `&index=${index}`;
    return axios.delete(url).then(res => res.data);
  },
  ShAnHoney: (text, uid, font, author) => axios.get(`${Sh4n}ShAn-honey?text=${encodeURIComponent(text)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnHteach: (ask, ans, uid, font, author) => axios.get(`${Sh4n}ShAn-hteach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnHmsg: (ask, uid, font, author) => axios.get(`${Sh4n}ShAn-hmsg?ask=${encodeURIComponent(ask)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnHlist: (font, author) => axios.get(`${Sh4n}ShAn-hlist?font=${font}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnHedit: (ask, newAsk, uid, font, author, index) => {
    let url = `${Sh4n}ShAn-hedit?ask=${encodeURIComponent(ask)}&newAsk=${encodeURIComponent(newAsk)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`;
    if (index) url += `&index=${index}`;
    return axios.get(url).then(res => res.data);
  },
  ShAnHdelete: (text, uid, font, author, index) => {
    let url = `${Sh4n}ShAn-hdelete?text=${encodeURIComponent(text)}&uid=${uid}&font=${font}&author=${encodeURIComponent(author)}`;
    if (index) url += `&index=${index}`;
    return axios.delete(url).then(res => res.data);
  },
  ShAnalbumVideos: (category, senderID, author, key) => axios.get(`${Sh4n}ShAn-album-videos?category=${category}&senderID=${senderID}&author=${encodeURIComponent(author)}&key=${encodeURIComponent(key)}`).then(res => res.data),
  ShAnalbumAdd: (category, videoUrl, senderID, author) => axios.post(`${Sh4n}ShAn-album-add?category=${category}&videoUrl=${encodeURIComponent(videoUrl)}&senderID=${senderID}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnalbumDelete: (url, author, key) => axios.delete(`${Sh4n}ShAn-album-delete?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}&key=${encodeURIComponent(key)}`).then(res => res.data),
  ShAnalbumList: (author) => axios.get(`${Sh4n}ShAn-album-list?author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnImgur: (videoUrl, author) => axios.post(`${Sh4n}ShAn-imgur?url=${encodeURIComponent(videoUrl)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAntikSearch: (query, author) => axios.get(`${Sh4n}ShAn-tiksearch?query=${encodeURIComponent(query)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnFont: (text, font, author) => axios.get(`${Sh4n}ShAn-font?text=${encodeURIComponent(text)}&font=${encodeURIComponent(font)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnfontList: (author) => axios.get(`${Sh4n}ShAn-fontList?author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnWish: (name, font, author) => axios.get(`${Sh4n}ShAn-wish?name=${encodeURIComponent(name)}&font=${encodeURIComponent(font)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAncaptionAdd: (category, language, caption, senderID, author) => axios.post(`${Sh4n}ShAn-caption-add?category=${encodeURIComponent(category)}&language=${encodeURIComponent(language)}&captain=${encodeURIComponent(caption)}&senderID=${encodeURIComponent(senderID)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAncaptionList: (language, author) => axios.get(`${Sh4n}ShAn-caption-list?language=${encodeURIComponent(language)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnCaption: (category, language, senderID, author, key) => axios.get(`${Sh4n}ShAn-caption?category=${encodeURIComponent(category)}&language=${encodeURIComponent(language)}&senderID=${encodeURIComponent(senderID)}&author=${encodeURIComponent(author)}&key=${encodeURIComponent(key)}`).then(res => res.data),
  ShAnmemeAdd: (memeUrl, senderID, author) => axios.post(`${Sh4n}ShAn-meme-add?memeUrl=${encodeURIComponent(memeUrl)}&senderID=${encodeURIComponent(senderID)}&author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnMeme: (author) => axios.get(`${Sh4n}ShAn-meme?author=${encodeURIComponent(author)}`).then(res => res.data),
  ShAnImgbb: (url, author) => axios.get(`${Sh4n}ShAn-imgbb?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data)
};

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

async function showMainMenu() {
  showLogo();
  
  console.log(`
\x1b[36m┌─────────────────────────────────────────────────────────┐\x1b[0m
\x1b[36m│                    📋 MAIN MENU                         │\x1b[0m
\x1b[36m├─────────────────────────────────────────────────────────┤\x1b[0m
\x1b[32m│  1. 📥 Download Videos                                  │\x1b[0m
\x1b[32m│  2. 🔍 Search Content                                   │\x1b[0m
\x1b[32m│  3. 🤖 AI Chatbots (Baby/Honey)                         │\x1b[0m
\x1b[32m│  4. 💾 Album Management                                 │\x1b[0m
\x1b[32m│  5. 🎨 Font & Text Utilities                            │\x1b[0m
\x1b[32m│  6. 📝 Caption Manager                                  │\x1b[0m
\x1b[32m│  7. 🖼️  Meme Generator                                  │\x1b[0m
\x1b[32m│  8. ☁️  Cloud Upload (Imgur/ImgBB)                      │\x1b[0m
\x1b[31m│  0. ❌ Exit                                              │\x1b[0m
\x1b[36m└─────────────────────────────────────────────────────────┘\x1b[0m
  `);
  
  const choice = await askQuestion('\x1b[36mSelect an option\x1b[0m', '0');
  return choice;
}

async function downloadMenu() {
  console.clear();
  showLogo();
  
  const platform = await selectOption('📥 Select Platform:', [
    'YouTube', 'TikTok', 'Instagram', 'Facebook', 'Twitter/X', 
    'Threads', 'Pinterest', 'CapCut', 'Likee', 'All-in-One'
  ]);
  
  let command = '';
  switch(platform) {
    case 'YouTube': command = 'ytdl'; break;
    case 'TikTok': command = 'tikdl'; break;
    case 'Instagram': command = 'instadl'; break;
    case 'Facebook': command = 'fbdl'; break;
    case 'Twitter/X': command = 'twitdl'; break;
    case 'Threads': command = 'threadl'; break;
    case 'Pinterest': command = 'pindl'; break;
    case 'CapCut': command = 'capcutdl'; break;
    case 'Likee': command = 'likeedl'; break;
    case 'All-in-One': command = 'alldl'; break;
  }
  
  const url = await askQuestion('\x1b[36mEnter video URL\x1b[0m');
  if (!url) {
    console.log('\x1b[31m❌ URL is required!\x1b[0m');
    await askQuestion('\nPress Enter to continue...');
    return;
  }
  
  const defaultAuthor = getDefaultAuthor();
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', defaultAuthor);
  
  console.log('\n\x1b[33m⏳ Processing your request...\x1b[0m\n');
  
  try {
    let result;
    switch(command) {
      case 'ytdl': result = await api.ShAnYtdl(url, author); break;
      case 'tikdl': result = await api.ShAnTikdl(url, author); break;
      case 'instadl': result = await api.ShAnInstadl(url, author); break;
      case 'fbdl': result = await api.ShAnFbdl(url, author); break;
      case 'twitdl': result = await api.ShAnTwitdl(url, author); break;
      case 'threadl': result = await api.ShAnThreadl(url, author); break;
      case 'pindl': result = await api.ShAnPindl(url, author); break;
      case 'capcutdl': result = await api.ShAnCapcutdl(url, author); break;
      case 'likeedl': result = await api.ShAnLikeedl(url, author); break;
      default: result = await api.ShAnAlldl(url, author);
    }
    
    console.log('\n\x1b[32m✅ SUCCESS!\x1b[0m\n');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('\x1b[31m❌ Error:\x1b[0m', err.response?.data || err.message);
  }
  
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

async function searchMenu() {
  console.clear();
  showLogo();
  
  const platform = await selectOption('🔍 Search On:', ['YouTube', 'TikTok']);
  const query = await askQuestion('\x1b[36mEnter search query\x1b[0m');
  
  if (!query) {
    console.log('\x1b[31m❌ Query is required!\x1b[0m');
    await askQuestion('\nPress Enter to continue...');
    return;
  }
  
  const defaultAuthor = getDefaultAuthor();
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', defaultAuthor);
  
  console.log('\n\x1b[33m⏳ Searching...\x1b[0m\n');
  
  try {
    let result;
    if (platform === 'YouTube') {
      result = await api.ShAnytSearch(query, author);
    } else {
      result = await api.ShAntikSearch(query, author);
    }
    
    console.log('\x1b[32m✅ Search Results:\x1b[0m\n');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('\x1b[31m❌ Error:\x1b[0m', err.response?.data || err.message);
  }
  
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

async function aiChatbotMenu() {
  console.clear();
  showLogo();
  
  const bot = await selectOption('🤖 Select AI Chatbot:', ['Baby', 'Honey']);
  const action = await selectOption('Select Action:', ['Chat', 'Teach', 'Random Response', 'List Data', 'Edit', 'Delete']);
  
  const defaultAuthor = getDefaultAuthor();
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', defaultAuthor);
  const uid = await askQuestion('\x1b[36mEnter User ID (your unique identifier)\x1b[0m', 'user123');
  const font = await askQuestion('\x1b[36mEnter Font name (default: Arial)\x1b[0m', 'Arial');
  
  try {
    let result;
    
    if (action === 'Chat') {
      const text = await askQuestion('\x1b[36mEnter your message\x1b[0m');
      if (bot === 'Baby') {
        result = await api.ShAnBaby(text, uid, font, author);
      } else {
        result = await api.ShAnHoney(text, uid, font, author);
      }
    } 
    else if (action === 'Teach') {
      const ask = await askQuestion('\x1b[36mEnter the question/phrase\x1b[0m');
      const ans = await askQuestion('\x1b[36mEnter the answer/response\x1b[0m');
      if (bot === 'Baby') {
        result = await api.ShAnBteach(ask, ans, uid, font, author);
      } else {
        result = await api.ShAnHteach(ask, ans, uid, font, author);
      }
    }
    else if (action === 'Random Response') {
      if (bot === 'Baby') {
        result = await api.ShAnBrans(author);
      } else {
        console.log('\x1b[33m⚠️ Random response only available for Baby bot\x1b[0m');
        await askQuestion('\nPress Enter to continue...');
        return;
      }
    }
    else if (action === 'List Data') {
      if (bot === 'Baby') {
        result = await api.ShAnBlist(font, author);
      } else {
        result = await api.ShAnHlist(font, author);
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
    }
    else if (action === 'Delete') {
      const text = await askQuestion('\x1b[36mEnter text to delete\x1b[0m');
      const index = await askQuestion('\x1b[36mEnter index (optional)\x1b[0m');
      if (bot === 'Baby') {
        result = await api.ShAnBdelete(text, uid, font, author, index);
      } else {
        result = await api.ShAnHdelete(text, uid, font, author, index);
      }
    }
    
    console.log('\x1b[32m✅ Success!\x1b[0m\n');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('\x1b[31m❌ Error:\x1b[0m', err.response?.data || err.message);
  }
  
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

async function albumMenu() {
  console.clear();
  showLogo();
  
  const action = await selectOption('💾 Album Actions:', ['List Albums', 'Add Video', 'View Videos', 'Delete Video']);
  const defaultAuthor = getDefaultAuthor();
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', defaultAuthor);
  
  try {
    let result;
    
    if (action === 'List Albums') {
      result = await api.ShAnalbumList(author);
    } 
    else if (action === 'Add Video') {
      const category = await askQuestion('\x1b[36mEnter category name\x1b[0m');
      const videoUrl = await askQuestion('\x1b[36mEnter video URL\x1b[0m');
      const senderID = await askQuestion('\x1b[36mEnter sender ID\x1b[0m');
      result = await api.ShAnalbumAdd(category, videoUrl, senderID, author);
    }
    else if (action === 'View Videos') {
      const category = await askQuestion('\x1b[36mEnter category name\x1b[0m');
      const senderID = await askQuestion('\x1b[36mEnter sender ID\x1b[0m');
      const key = await askQuestion('\x1b[36mEnter access key (optional)\x1b[0m');
      result = await api.ShAnalbumVideos(category, senderID, author, key);
    }
    else if (action === 'Delete Video') {
      const url = await askQuestion('\x1b[36mEnter video URL to delete\x1b[0m');
      const key = await askQuestion('\x1b[36mEnter access key\x1b[0m');
      result = await api.ShAnalbumDelete(url, author, key);
    }
    
    console.log('\x1b[32m✅ Success!\x1b[0m\n');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('\x1b[31m❌ Error:\x1b[0m', err.response?.data || err.message);
  }
  
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

async function fontMenu() {
  console.clear();
  showLogo();
  
  const action = await selectOption('🎨 Font Utilities:', ['Apply Font to Text', 'List Available Fonts', 'Generate Wish Card']);
  const defaultAuthor = getDefaultAuthor();
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', defaultAuthor);
  
  try {
    if (action === 'List Available Fonts') {
      const result = await api.ShAnfontList(author);
      console.log('\n\x1b[32m✅ Available Fonts:\x1b[0m\n');
      console.log(JSON.stringify(result, null, 2));
    } 
    else if (action === 'Apply Font to Text') {
      const text = await askQuestion('\x1b[36mEnter your text\x1b[0m');
      const font = await askQuestion('\x1b[36mEnter font name\x1b[0m', 'Arial');
      const result = await api.ShAnFont(text, font, author);
      console.log('\x1b[32m✅ Formatted Text:\x1b[0m\n');
      console.log(result);
    }
    else if (action === 'Generate Wish Card') {
      const name = await askQuestion('\x1b[36mEnter name for wish card\x1b[0m');
      const font = await askQuestion('\x1b[36mEnter font name\x1b[0m', 'Arial');
      const result = await api.ShAnWish(name, font, author);
      console.log('\x1b[32m✅ Wish Card Generated:\x1b[0m\n');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.error('\x1b[31m❌ Error:\x1b[0m', err.response?.data || err.message);
  }
  
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

async function captionMenu() {
  console.clear();
  showLogo();
  
  const action = await selectOption('📝 Caption Manager:', ['Add Caption', 'Get Caption', 'List Captions']);
  const defaultAuthor = getDefaultAuthor();
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', defaultAuthor);
  
  try {
    if (action === 'Add Caption') {
      const category = await askQuestion('\x1b[36mEnter category\x1b[0m');
      const language = await askQuestion('\x1b[36mEnter language (e.g., en, es, hi)\x1b[0m');
      const caption = await askQuestion('\x1b[36mEnter caption text\x1b[0m');
      const senderID = await askQuestion('\x1b[36mEnter sender ID\x1b[0m');
      const result = await api.ShAncaptionAdd(category, language, caption, senderID, author);
      console.log('\x1b[32m✅ Caption Added!\x1b[0m\n');
      console.log(JSON.stringify(result, null, 2));
    }
    else if (action === 'List Captions') {
      const language = await askQuestion('\x1b[36mEnter language\x1b[0m', 'en');
      const result = await api.ShAncaptionList(language, author);
      console.log('\x1b[32m✅ Captions List:\x1b[0m\n');
      console.log(JSON.stringify(result, null, 2));
    }
    else if (action === 'Get Caption') {
      const category = await askQuestion('\x1b[36mEnter category\x1b[0m');
      const language = await askQuestion('\x1b[36mEnter language\x1b[0m');
      const senderID = await askQuestion('\x1b[36mEnter sender ID\x1b[0m');
      const key = await askQuestion('\x1b[36mEnter access key (optional)\x1b[0m');
      const result = await api.ShAnCaption(category, language, senderID, author, key);
      console.log('\x1b[32m✅ Caption:\x1b[0m\n');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.error('\x1b[31m❌ Error:\x1b[0m', err.response?.data || err.message);
  }
  
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

async function memeMenu() {
  console.clear();
  showLogo();
  
  const action = await selectOption('🖼️  Meme Generator:', ['Get Random Meme', 'Add New Meme']);
  const defaultAuthor = getDefaultAuthor();
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', defaultAuthor);
  
  try {
    if (action === 'Get Random Meme') {
      const result = await api.ShAnMeme(author);
      console.log('\x1b[32m✅ Random Meme:\x1b[0m\n');
      console.log(JSON.stringify(result, null, 2));
    } 
    else if (action === 'Add New Meme') {
      const memeUrl = await askQuestion('\x1b[36mEnter meme image/video URL\x1b[0m');
      const senderID = await askQuestion('\x1b[36mEnter sender ID\x1b[0m');
      const result = await api.ShAnmemeAdd(memeUrl, senderID, author);
      console.log('\x1b[32m✅ Meme Added!\x1b[0m\n');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.error('\x1b[31m❌ Error:\x1b[0m', err.response?.data || err.message);
  }
  
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

async function cloudMenu() {
  console.clear();
  showLogo();
  
  const platform = await selectOption('☁️  Upload To:', ['Imgur', 'ImgBB']);
  const url = await askQuestion('\x1b[36mEnter media URL to upload\x1b[0m');
  const defaultAuthor = getDefaultAuthor();
  const author = await askQuestion('\x1b[36mEnter your name/author ID\x1b[0m', defaultAuthor);
  
  if (!url) {
    console.log('\x1b[31m❌ URL is required!\x1b[0m');
    await askQuestion('\nPress Enter to continue...');
    return;
  }
  
  console.log('\n\x1b[33m⏳ Uploading...\x1b[0m\n');
  
  try {
    let result;
    if (platform === 'Imgur') {
      result = await api.ShAnImgur(url, author);
    } else {
      result = await api.ShAnImgbb(url, author);
    }
    
    console.log('\x1b[32m✅ Upload Successful!\x1b[0m\n');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('\x1b[31m❌ Error:\x1b[0m', err.response?.data || err.message);
  }
  
  await askQuestion('\n\x1b[36mPress Enter to continue...\x1b[0m');
}

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showLogo();
    console.log(`
\x1b[36mSHAN SERVER - Interactive Media Downloader & Utilities\x1b[0m

\x1b[33mUSAGE:\x1b[0m
  shan              Start interactive menu
  shan --help       Show this help
  shan --version    Show version

\x1b[33mAUTO-AUTHOR (CLI ONLY):\x1b[0m
  The CLI automatically detects your system username and uses it as the default author.
  If no username is found, it defaults to: \x1b[36m♡︎ 𝗦𝗵𝗔𝗻 ♡︎\x1b[0m

\x1b[33mCODE USAGE:\x1b[0m
  When using in code, author is \x1b[31mREQUIRED\x1b[0m:
  const shan = require('shan-server');
  const result = await shan.ShAnYtdl(url, '♡︎ 𝗦𝗵𝗔𝗻 ♡︎');

\x1b[33mDESCRIPTION:\x1b[0m
  An interactive CLI tool for downloading videos from YouTube, TikTok, 
  Instagram, Facebook, Twitter, and more. Also includes AI chatbots, 
  album storage, captions, fonts, memes, and cloud uploads.

\x1b[33mSUPPORTED PLATFORMS:\x1b[0m
  ✓ Windows (CMD, PowerShell, Terminal)
  ✓ Linux (bash, zsh, fish)
  ✓ macOS (Terminal, iTerm2)
  ✓ Termux (Android)
  ✓ Chrome OS
  ✓ Any OS with Node.js

\x1b[33mREQUIREMENTS:\x1b[0m
  Node.js >= 12.0.0

\x1b[33mEXAMPLES:\x1b[0m
  $ shan                    # Start interactive menu
  $ npx shan-server         # Run without installing
  $ node -e "require('shan-server').ShAnYtdl('url', '♡︎ 𝗦𝗵𝗔𝗻 ♡︎')"

\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
    `);
    process.exit(0);
  }
  
  if (process.argv.includes('--version') || process.argv.includes('-v')) {
    console.log('shan-server v1.0.4');
    console.log(`Default Author: ${getDefaultAuthor()}`);
    process.exit(0);
  }
  
  while (true) {
    const choice = await showMainMenu();
    
    switch(choice) {
      case '1':
        await downloadMenu();
        break;
      case '2':
        await searchMenu();
        break;
      case '3':
        await aiChatbotMenu();
        break;
      case '4':
        await albumMenu();
        break;
      case '5':
        await fontMenu();
        break;
      case '6':
        await captionMenu();
        break;
      case '7':
        await memeMenu();
        break;
      case '8':
        await cloudMenu();
        break;
      case '0':
        console.log('\n\x1b[36m👋 Thank you for using SHAN SERVER!\x1b[0m\n');
        process.exit(0);
      default:
        console.log('\x1b[31m❌ Invalid option! Please try again.\x1b[0m');
        await askQuestion('\nPress Enter to continue...');
    }
  }
}

process.on('SIGINT', () => {
  console.log('\n\n\x1b[36m👋 Goodbye from SHAN SERVER!\x1b[0m\n');
  process.exit(0);
});

if (require.main === module) {
  main().catch(console.error);
}

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
  ShAntikSearch: api.ShAntikSearch,
  ShAnFont: api.ShAnFont,
  ShAnfontList: api.ShAnfontList,
  ShAnWish: api.ShAnWish,
  ShAncaptionAdd: api.ShAncaptionAdd,
  ShAncaptionList: api.ShAncaptionList,
  ShAnCaption: api.ShAnCaption,
  ShAnmemeAdd: api.ShAnmemeAdd,
  ShAnMeme: api.ShAnMeme,
  ShAnImgbb: api.ShAnImgbb,
  getDefaultAuthor
};
