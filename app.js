// ===== Phrase-to-GIF Mapping Engine =====
const PHRASE_MAP = {
    // Check-in / Hello again
    "checking in": ["peeking around corner", "hello again funny", "hey there wave", "sneaking in", "popping in", "knocking door funny"],
    "just checking in": ["peeking around corner", "casual wave", "hey buddy", "looking around", "subtle entrance"],
    // Circling back
    "circling back": ["boomerang", "coming back", "return funny", "back again", "deja vu", "round and round"],
    "circle back": ["boomerang", "spinning around", "returning hero", "im back", "came back"],
    // Following up
    "following up": ["detective funny", "on the trail", "following", "hot pursuit", "tracking down", "sherlock"],
    "follow up": ["detective searching", "on the case", "chasing", "pursuing", "hunting funny"],
    // Reminder
    "reminder": ["alarm clock funny", "nudge", "tap shoulder", "ding dong", "wake up funny", "don't forget"],
    "just a reminder": ["sticky note", "bell ringing", "friendly reminder", "psst hey", "memo"],
    "gentle reminder": ["soft nudge", "excuse me polite", "ahem", "subtle hint", "small tap"],
    // Updates
    "any updates": ["waiting patiently funny", "still waiting", "looking around", "checking watch", "tapping fingers", "patience"],
    "updates": ["news anchor funny", "breaking news", "whats new", "mailbox waiting", "refresh"],
    // Touching base
    "touching base": ["baseball slide", "home base", "touchdown", "high five attempt", "reaching out"],
    "touch base": ["baseball funny", "making contact", "connecting", "base hit", "reaching out"],
    // Bumping / Moving up
    "bumping this up": ["bump funny", "rising up", "elevator going up", "floating up", "spring bounce"],
    "bump": ["fist bump", "bump it", "bounce funny", "boing", "spring"],
    // Still interested
    "still interested": ["raising hand", "pick me", "interested face", "eyes wide open", "attention"],
    // Haven't heard back
    "haven't heard back": ["hello anyone there", "echo", "crickets funny", "tumbleweeds", "empty room", "ghost town"],
    "havent heard": ["crickets chirping", "silence", "anyone home", "knocking on door", "ghosted"],
    // Quick question
    "quick question": ["raising hand funny", "excuse me", "question mark", "curious cat", "thinking emoji"],
    // Miss you / Where are you
    "miss you": ["miss you funny", "come back", "lonely without you", "sad puppy", "waiting for you"],
    // Wanted to reconnect
    "reconnect": ["plug connecting", "handshake", "reunion funny", "together again", "wifi connecting"],
    // Looping back
    "looping back": ["loop de loop", "roller coaster loop", "spinning", "orbit", "returning"],
    // Breaking the ice
    "breaking the ice": ["ice breaker", "penguin sliding", "polar bear", "ice skating fall", "frozen funny"],
    // Hope you're well
    "hope you're well": ["waving hello friendly", "sunshine happy", "warm greeting", "positive vibes", "good morning friendly"],
    // Reaching out
    "reaching out": ["hand reaching out", "stretching far", "across the table", "extending hand", "hello reach"],
    // Closing the deal
    "close the deal": ["handshake deal", "money celebration", "cha ching", "champagne pop", "victory dance"],
    // Generic fun
    "hey": ["hey there wave", "hello greeting", "hey whats up", "casual wave", "hi there"],
    "hi": ["waving hello", "greeting", "hello funny", "hey there", "hi wave"],
    "hello": ["hello there", "greeting funny", "saying hello", "wave hello", "hey hello"]
};

// Category definitions for quick picks
const CATEGORIES = [
    { id: "check-in", label: "Check-in", emoji: "👋", keywords: ["peeking around corner", "hello again funny", "sneaking in", "popping in"] },
    { id: "follow-up", label: "Follow Up", emoji: "🔍", keywords: ["detective funny", "on the trail", "sherlock", "tracking down"] },
    { id: "reminder", label: "Reminder", emoji: "⏰", keywords: ["alarm clock funny", "nudge", "tap shoulder", "dont forget"] },
    { id: "waiting", label: "Still Waiting", emoji: "⏳", keywords: ["waiting patiently funny", "checking watch", "tapping fingers", "still waiting"] },
    { id: "comeback", label: "I'm Back", emoji: "🪃", keywords: ["boomerang", "im back baby", "return of the king", "back again"] },
    { id: "crickets", label: "Crickets", emoji: "🦗", keywords: ["crickets funny", "tumbleweeds", "anyone there", "hello echo"] },
    { id: "icebreaker", label: "Ice Breaker", emoji: "🧊", keywords: ["ice breaker funny", "penguin sliding", "awkward introduction", "first meeting"] },
    { id: "celebrate", label: "Let's Go!", emoji: "🎉", keywords: ["celebration dance", "lets go party", "excited happy", "victory dance"] },
    { id: "puppy-eyes", label: "Puppy Eyes", emoji: "🥺", keywords: ["puppy eyes please", "sad puppy", "begging please", "pretty please"] },
    { id: "superhero", label: "Super Entry", emoji: "🦸", keywords: ["superhero entrance", "superman flying", "dramatic entrance", "hero arrives"] },
];

const GIPHY_SEARCH_URL = "https://api.giphy.com/v1/gifs/search";
let GIPHY_API_KEY = localStorage.getItem("giphy_api_key") || "";

// DOM Elements
const phraseInput = document.getElementById("phrase-input");
const searchBtn = document.getElementById("search-btn");
const categoryChips = document.getElementById("category-chips");
const gifGrid = document.getElementById("gif-grid");
const emptyState = document.getElementById("empty-state");
const loadingState = document.getElementById("loading-state");
const keywordDisplay = document.getElementById("keyword-display");
const keywordTags = document.getElementById("keyword-tags");
const modalOverlay = document.getElementById("modal-overlay");
const modalGif = document.getElementById("modal-gif");
const modalClose = document.getElementById("modal-close");
const copyLinkBtn = document.getElementById("copy-link-btn");
const copyGifBtn = document.getElementById("copy-gif-btn");
const downloadBtn = document.getElementById("download-btn");
const toast = document.getElementById("toast");

const setupOverlay = document.getElementById("setup-overlay");
const apiKeyInput = document.getElementById("api-key-input");
const saveKeyBtn = document.getElementById("save-key-btn");
const skipKeyBtn = document.getElementById("skip-key-btn");
const changeKeyBtn = document.getElementById("change-key-btn");

const personalizeToggle = document.getElementById("personalize-toggle");
const personalizeBody = document.getElementById("personalize-body");
const overlayTextInput = document.getElementById("overlay-text");
const textPreview = document.getElementById("text-preview");
const posBtns = document.querySelectorAll(".toggle-btn[data-pos]");
const textColorPicker = document.getElementById("text-color");
const toggleOutlineBtn = document.getElementById("toggle-outline");
const generateGifBtn = document.getElementById("generate-gif-btn");
const generateText = document.getElementById("generate-text");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");

let currentGifUrl = "";
let currentGifDownloadUrl = "";
let customGifBlobUrl = null;
let activeChip = null;

// Initialize
function init() {
    renderCategoryChips();
    bindEvents();
    if (!GIPHY_API_KEY) showSetup();
}

function showSetup() { setupOverlay.classList.add("active"); }
function hideSetup() { setupOverlay.classList.remove("active"); }

function renderCategoryChips() {
    categoryChips.innerHTML = CATEGORIES.map(cat => `
        <button class="chip" data-category="${cat.id}">
            <span class="chip-emoji">${cat.emoji}</span>
            ${cat.label}
        </button>
    `).join("");
}

function bindEvents() {
    searchBtn.addEventListener("click", handleSearch);
    phraseInput.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSearch(); });
    categoryChips.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (chip) handleCategoryClick(chip);
    });
    modalClose.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
    copyLinkBtn.addEventListener("click", () => copyToClipboard(currentGifUrl));
    copyGifBtn.addEventListener("click", copyGifToClipboard);
    downloadBtn.addEventListener("click", downloadGif);

    // Personalize UI
    personalizeToggle.addEventListener("click", () => {
        const isOpen = personalizeBody.classList.contains("open");
        if (isOpen) {
            personalizeBody.classList.remove("open");
            personalizeToggle.classList.remove("open");
        } else {
            personalizeBody.classList.add("open");
            personalizeToggle.classList.add("open");
        }
    });

    overlayTextInput.addEventListener("input", (e) => { textPreview.textContent = e.target.value; });

    posBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            posBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            textPreview.setAttribute("data-pos", btn.dataset.pos);
        });
    });

    textColorPicker.addEventListener("input", (e) => { textPreview.style.color = e.target.value; });
    toggleOutlineBtn.addEventListener("click", () => {
        toggleOutlineBtn.classList.toggle("active");
        textPreview.classList.toggle("no-outline");
    });

    generateGifBtn.addEventListener("click", generatePersonalizedGif);

    saveKeyBtn.addEventListener("click", () => {
        const key = apiKeyInput.value.trim();
        if (!key) return;
        GIPHY_API_KEY = key;
        localStorage.setItem("giphy_api_key", key);
        hideSetup();
        showToastGlobal("API key saved! You're all set 🎉");
    });
    skipKeyBtn.addEventListener("click", hideSetup);
    changeKeyBtn.addEventListener("click", () => {
        apiKeyInput.value = GIPHY_API_KEY;
        showSetup();
    });
}

function handleSearch() {
    const input = phraseInput.value.trim().toLowerCase();
    if (!input) return;
    if (!GIPHY_API_KEY) { showSetup(); return; }
    clearActiveChip();
    const keywords = mapPhraseToKeywords(input);
    showKeywords(keywords);
    searchGifs(keywords);
}

function mapPhraseToKeywords(phrase) {
    if (PHRASE_MAP[phrase]) return PHRASE_MAP[phrase];
    const phraseWords = phrase.split(/\s+/);
    let bestMatch = null; let bestScore = 0;
    for (const key of Object.keys(PHRASE_MAP)) {
        const keyWords = key.split(/\s+/);
        let score = 0;
        for (const kw of keyWords) if (phraseWords.includes(kw)) score++;
        if (phrase.includes(key)) score += keyWords.length * 2;
        if (score > bestScore) { bestScore = score; bestMatch = key; }
    }
    if (bestMatch && bestScore > 0) return PHRASE_MAP[bestMatch];
    return [`${phrase} funny`, `${phrase} reaction`, `${phrase} gif`];
}

function handleCategoryClick(chip) {
    const categoryId = chip.dataset.category;
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;
    if (!GIPHY_API_KEY) { showSetup(); return; }
    if (activeChip === categoryId) { clearActiveChip(); return; }
    clearActiveChip();
    activeChip = categoryId;
    chip.classList.add("active");
    phraseInput.value = "";
    showKeywords(category.keywords);
    searchGifs(category.keywords);
}

function clearActiveChip() {
    document.querySelectorAll(".chip.active").forEach(c => c.classList.remove("active"));
    activeChip = null;
}

// GIF Fetching
async function searchGifs(keywords) {
    showLoading();
    try {
        const searchQueries = keywords.slice(0, 3);
        const allGifs = [];
        const seenIds = new Set();
        const results = await Promise.all(
            searchQueries.map(q =>
                fetch(`${GIPHY_SEARCH_URL}?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=8&rating=pg`)
                    .then(r => {
                        if (r.status === 403 || r.status === 401) throw new Error("INVALID_KEY");
                        return r.json();
                    }).catch(err => { if (err.message === "INVALID_KEY") throw err; return { data: [] }; })
            )
        );
        for (const result of results) {
            if (result.data) {
                for (const gif of result.data) {
                    if (!seenIds.has(gif.id)) { seenIds.add(gif.id); allGifs.push(gif); }
                }
            }
        }
        const shuffled = allGifs.sort(() => Math.random() - 0.5).slice(0, 12);
        renderGifs(shuffled);
    } catch (err) {
        if (err.message === "INVALID_KEY") {
            hideLoading();
            GIPHY_API_KEY = "";
            localStorage.removeItem("giphy_api_key");
            showSetup();
            showToastGlobal("API key is invalid. Please enter a valid key.");
            return;
        }
        console.error("fetch err", err);
        showEmpty();
    }
}

// Rendering
function renderGifs(gifs) {
    hideLoading();
    if (gifs.length === 0) { showEmpty(); return; }
    emptyState.style.display = "none";
    gifGrid.innerHTML = gifs.map(gif => `
        <div class="gif-card" data-gif-url="${gif.images.original.url}" data-gif-download="${gif.images.original.url}" data-gif-title="${gif.title || 'GIF'}">
            <img src="${gif.images.fixed_height.url}" alt="${gif.title || 'GIF'}" loading="lazy">
            <div class="gif-card-overlay"><span class="gif-card-label">Click to preview</span></div>
        </div>
    `).join("");
    gifGrid.querySelectorAll(".gif-card").forEach(card => {
        card.addEventListener("click", () => openModal(card));
    });
}
function showKeywords(keywords) {
    keywordDisplay.style.display = "flex";
    keywordTags.innerHTML = keywords.slice(0, 4).map(k => `<span class="keyword-tag">${k}</span>`).join("");
}
function showLoading() { gifGrid.innerHTML = ""; emptyState.style.display = "none"; loadingState.style.display = "block"; }
function hideLoading() { loadingState.style.display = "none"; }
function showEmpty() { hideLoading(); gifGrid.innerHTML = ""; emptyState.style.display = "block"; }

// Modal
function openModal(card) {
    currentGifUrl = card.dataset.gifUrl;
    currentGifDownloadUrl = card.dataset.gifDownload;
    modalGif.src = currentGifUrl;
    personalizeBody.classList.remove("open");
    personalizeToggle.classList.remove("open");
    textPreview.textContent = "";
    overlayTextInput.value = "";
    customGifBlobUrl = null;
    generateText.textContent = "Generate Personalized GIF";
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}
function closeModal() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => {
        modalGif.src = "";
        textPreview.textContent = "";
        if (customGifBlobUrl) { URL.revokeObjectURL(customGifBlobUrl); customGifBlobUrl = null; }
    }, 300);
}

// Copy & Download
async function copyToClipboard(text) {
    try { await navigator.clipboard.writeText(text); showToast("Link copied!"); }
    catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); showToast("Link copied!"); }
}
async function copyGifToClipboard() {
    try {
        const targetUrl = customGifBlobUrl || currentGifUrl;
        const response = await fetch(targetUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        showToast("GIF copied to clipboard!");
    } catch { await copyToClipboard(currentGifUrl); showToast("Link copied (GIF copy not supported directly)"); }
}
async function downloadGif() {
    try {
        const targetUrl = customGifBlobUrl || currentGifDownloadUrl;
        showToast("Downloading...");
        const response = await fetch(targetUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "follow-up-gif.gif";
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        showToast("Downloaded!");
    } catch { window.open(currentGifDownloadUrl, "_blank"); showToast("Opened in tab"); }
}
function showToast(message) { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2000); }
function showToastGlobal(message) { const globalToast = document.getElementById("global-toast"); globalToast.textContent = message; globalToast.classList.add("show"); setTimeout(() => globalToast.classList.remove("show"), 3000); }


// ===== GIF Personalization =====
async function generatePersonalizedGif() {
    const text = overlayTextInput.value.trim();
    if (!text) {
        showToast("Please enter some text first.");
        return;
    }

    generateGifBtn.disabled = true;
    generateText.textContent = "Processing...";
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";

    try {
        const response = await fetch(currentGifUrl, { cache: "no-store", mode: "cors" });
        if (!response.ok) throw new Error("Could not fetch GIF");
        const buffer = await response.arrayBuffer();
        
        const { parseGIF, decompressFrames } = await import('https://esm.sh/gifuct-js@2.1.2');
        const gifBuffer = new Uint8Array(buffer);
        const gif = parseGIF(gifBuffer);
        const frames = decompressFrames(gif, true);
        
        if (!frames || frames.length === 0) throw new Error("No frames found");

        const width = frames[0].dims.width;
        const height = frames[0].dims.height;

        const encoder = new window.GIF({
            workers: 2,
            quality: 10,
            width: width,
            height: height,
            workerScript: 'gif.worker.js' 
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;

        const frameCanvas = document.createElement("canvas");
        const frameCtx = frameCanvas.getContext("2d");
        frameCanvas.width = width;
        frameCanvas.height = height;

        const pos = document.querySelector(".toggle-btn[data-pos].active").dataset.pos;
        const color = textColorPicker.value;
        const hasOutline = toggleOutlineBtn.classList.contains("active");

        let previousImageData = null;

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            
            if (frame.disposalType === 3 && previousImageData === null) {
                previousImageData = frameCtx.getImageData(0, 0, width, height);
            }

            const patchData = new ImageData(
                new Uint8ClampedArray(frame.patch),
                frame.dims.width,
                frame.dims.height
            );
            
            frameCtx.putImageData(patchData, frame.dims.left, frame.dims.top);

            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(frameCanvas, 0, 0);

            // ----- DRAW TEXT OVERLAY -----
            if (text) {
                const fontSize = Math.max(16, Math.floor(width / 10)); 
                ctx.font = `900 ${fontSize}px "Impact", "Arial Black", sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = pos === "top" ? "top" : "bottom";
                
                const padding = 10;
                const x = width / 2;
                let y = pos === "top" ? padding : height - padding;

                const words = text.split(" ");
                let line = "";
                const lines = [];
                
                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + " ";
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > width - 20 && n > 0) {
                        lines.push(line);
                        line = words[n] + " ";
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);

                const lineHeight = fontSize * 1.2;
                if (pos === "bottom") {
                    y -= (lines.length - 1) * lineHeight;
                }

                for (let j = 0; j < lines.length; j++) {
                    const drawY = y + (j * lineHeight);
                    if (hasOutline) {
                        ctx.strokeStyle = "rgba(0,0,0,0.8)";
                        ctx.lineWidth = Math.max(2, fontSize / 10);
                        ctx.strokeText(lines[j].trim(), x, drawY);
                    }
                    ctx.fillStyle = color;
                    ctx.fillText(lines[j].trim(), x, drawY);
                }
            }

            encoder.addFrame(ctx, { delay: frame.delay, copy: true });

            if (frame.disposalType === 2) { 
                frameCtx.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height);
            } else if (frame.disposalType === 3 && previousImageData) { 
                frameCtx.putImageData(previousImageData, 0, 0);
            }
            if (frame.disposalType !== 3) previousImageData = null;
        }

        generateText.textContent = "Encoding GIF...";

        encoder.on('progress', pct => {
            progressBar.style.width = `${Math.round(pct * 100)}%`;
        });

        encoder.on('finished', blob => {
            if (customGifBlobUrl) URL.revokeObjectURL(customGifBlobUrl);
            customGifBlobUrl = URL.createObjectURL(blob);
            modalGif.src = customGifBlobUrl;
            generateGifBtn.disabled = false;
            generateText.textContent = "Success! Generated 🎉";
            setTimeout(() => {
                progressContainer.style.display = "none";
                progressBar.style.width = "0%";
                generateText.textContent = "Generate Personalized GIF";
            }, 3000);
        });

        encoder.render();

    } catch (err) {
        console.error("Personalization error:", err);
        generateGifBtn.disabled = false;
        generateText.textContent = "Error generating GIF";
        progressContainer.style.display = "none";
        showToast("Failed to process GIF. Try a different one.");
    }
}

init();
