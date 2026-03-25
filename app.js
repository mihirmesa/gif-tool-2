// ===== Configuration =====
const API_KEY = "fbdypjBzqGCnYCeJykM4KuWLVP7aVrD6";
const GIPHY_SEARCH_URL = "https://api.giphy.com/v1/gifs/search";

// ===== Phrase-to-GIF Mapping Engine =====
const PHRASE_MAP = {
    "checking in": ["peeking around corner", "hello again funny", "hey there wave", "sneaking in", "popping in", "knocking door funny"],
    "just checking in": ["peeking around corner", "casual wave", "hey buddy", "looking around", "subtle entrance"],
    "circling back": ["boomerang", "coming back", "return funny", "back again", "deja vu", "round and round"],
    "circle back": ["boomerang", "spinning around", "returning hero", "im back", "came back"],
    "following up": ["detective funny", "on the trail", "following", "hot pursuit", "tracking down", "sherlock"],
    "follow up": ["detective searching", "on the case", "chasing", "pursuing", "hunting funny"],
    "reminder": ["alarm clock funny", "nudge", "tap shoulder", "ding dong", "wake up funny", "don't forget"],
    "just a reminder": ["sticky note", "bell ringing", "friendly reminder", "psst hey", "memo"],
    "gentle reminder": ["soft nudge", "excuse me polite", "ahem", "subtle hint", "small tap"],
    "any updates": ["waiting patiently funny", "still waiting", "looking around", "checking watch", "tapping fingers", "patience"],
    "updates": ["news anchor funny", "breaking news", "whats new", "mailbox waiting", "refresh"],
    "touching base": ["baseball slide", "home base", "touchdown", "high five attempt", "reaching out"],
    "touch base": ["baseball funny", "making contact", "connecting", "base hit", "reaching out"],
    "bumping this up": ["bump funny", "rising up", "elevator going up", "floating up", "spring bounce"],
    "bump": ["fist bump", "bump it", "bounce funny", "boing", "spring"],
    "still interested": ["raising hand", "pick me", "interested face", "eyes wide open", "attention"],
    "haven't heard back": ["hello anyone there", "echo", "crickets funny", "tumbleweeds", "empty room", "ghost town"],
    "havent heard": ["crickets chirping", "silence", "anyone home", "knocking on door", "ghosted"],
    "quick question": ["raising hand funny", "excuse me", "question mark", "curious cat", "thinking emoji"],
    "miss you": ["miss you funny", "come back", "lonely without you", "sad puppy", "waiting for you"],
    "reconnect": ["plug connecting", "handshake", "reunion funny", "together again", "wifi connecting"],
    "looping back": ["loop de loop", "roller coaster loop", "spinning", "orbit", "returning"],
    "breaking the ice": ["ice breaker", "penguin sliding", "polar bear", "ice skating fall", "frozen funny"],
    "hope you're well": ["waving hello friendly", "sunshine happy", "warm greeting", "positive vibes", "good morning friendly"],
    "reaching out": ["hand reaching out", "stretching far", "across the table", "extending hand", "hello reach"],
    "close the deal": ["handshake deal", "money celebration", "cha ching", "champagne pop", "victory dance"],
    "hey": ["hey there wave", "hello greeting", "hey whats up", "casual wave", "hi there"],
    "hi": ["waving hello", "greeting", "hello funny", "hey there", "hi wave"],
    "hello": ["hello there", "greeting funny", "saying hello", "wave hello", "hey hello"]
};

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
    console.log("App initializing...");
    renderCategoryChips();
    bindEvents();
}

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
        personalizeBody.classList.toggle("open");
        personalizeToggle.classList.toggle("open");
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

    generateGifBtn.addEventListener("click", () => {
        console.log("Generate Button Clicked");
        generatePersonalizedGif();
    });
}

function handleSearch() {
    const input = phraseInput.value.trim().toLowerCase();
    if (!input) return;
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
                fetch(`${GIPHY_SEARCH_URL}?api_key=${API_KEY}&q=${encodeURIComponent(q)}&limit=8&rating=pg`)
                    .then(r => r.json()).catch(() => ({ data: [] }))
            )
        );
        for (const result of results) {
            if (result.data) {
                for (const gif of result.data) {
                    if (!seenIds.has(gif.id)) { seenIds.add(gif.id); allGifs.push(gif); }
                }
            }
        }
        renderGifs(allGifs.sort(() => Math.random() - 0.5).slice(0, 12));
    } catch (err) {
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
            <div class="gif-card-overlay"><span class="gif-card-label">Personalize</span></div>
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

// Utils
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
    } catch { await copyToClipboard(currentGifUrl); showToast("Link copied!"); }
}
async function downloadGif() {
    try {
        const targetUrl = customGifBlobUrl || currentGifDownloadUrl;
        showToast("Downloading...");
        const response = await fetch(targetUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "personalized.gif";
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        showToast("Downloaded!");
    } catch { window.open(currentGifDownloadUrl, "_blank"); }
}
function showToast(message) { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2000); }

// ===== GIF Personalization Logic =====
async function generatePersonalizedGif() {
    const text = overlayTextInput.value.trim();
    if (!text) { showToast("Please enter some text!"); return; }

    console.log("Starting personalization for:", text);
    generateGifBtn.disabled = true;
    generateText.textContent = "Processing Frames...";
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";

    try {
        console.log("Fetching GIF buffer...");
        const response = await fetch(currentGifUrl, { cache: "no-store", mode: "cors" });
        if (!response.ok) throw new Error("Fetch failed");
        const buffer = await response.arrayBuffer();
        
        console.log("Importing gifuct-js...");
        const { parseGIF, decompressFrames } = await import('https://esm.sh/gifuct-js@2.1.2');
        const gif = parseGIF(new Uint8Array(buffer));
        const frames = decompressFrames(gif, true);
        
        if (!frames.length) throw new Error("No frames");
        const { width, height } = frames[0].dims;

        console.log("Initializing GIF encoder...");
        const encoder = new window.GIF({
            workers: 2,
            quality: 10,
            width: width,
            height: height,
            workerScript: 'gif.worker.js' 
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = width; canvas.height = height;

        const frameCanvas = document.createElement("canvas");
        const frameCtx = frameCanvas.getContext("2d");
        frameCanvas.width = width; frameCanvas.height = height;

        const pos = document.querySelector(".toggle-btn[data-pos].active").dataset.pos;
        const color = textColorPicker.value;
        const hasOutline = toggleOutlineBtn.classList.contains("active");

        let prevData = null;
        for (let i = 0; i < frames.length; i++) {
            const f = frames[i];
            if (f.disposalType === 3 && prevData === null) prevData = frameCtx.getImageData(0,0,width,height);
            
            const patch = new ImageData(new Uint8ClampedArray(f.patch), f.dims.width, f.dims.height);
            frameCtx.putImageData(patch, f.dims.left, f.dims.top);
            
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(frameCanvas, 0, 0);

            // Text
            const fontSize = Math.max(16, Math.floor(width / 10));
            ctx.font = `900 ${fontSize}px Impact`;
            ctx.textAlign = "center";
            ctx.textBaseline = pos === "top" ? "top" : "bottom";
            const x = width / 2;
            const y = pos === "top" ? 10 : height - 10;

            if (hasOutline) {
                ctx.strokeStyle = "black";
                ctx.lineWidth = 4;
                ctx.strokeText(text, x, y);
            }
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);

            encoder.addFrame(ctx, { delay: f.delay, copy: true });

            if (f.disposalType === 2) frameCtx.clearRect(f.dims.left, f.dims.top, f.dims.width, f.dims.height);
            else if (f.disposalType === 3 && prevData) frameCtx.putImageData(prevData, 0, 0);
            if (f.disposalType !== 3) prevData = null;
        }

        encoder.on('progress', p => progressBar.style.width = `${Math.round(p * 100)}%`);
        encoder.on('finished', blob => {
            console.log("GIF Encoding Finished");
            if (customGifBlobUrl) URL.revokeObjectURL(customGifBlobUrl);
            customGifBlobUrl = URL.createObjectURL(blob);
            modalGif.src = customGifBlobUrl;
            generateGifBtn.disabled = false;
            generateText.textContent = "Success! Generated 🎉";
            setTimeout(() => {
                progressContainer.style.display = "none";
                generateText.textContent = "Generate Personalized GIF";
            }, 3000);
        });

        console.log("Rendering...");
        encoder.render();

    } catch (err) {
        console.error("Personalization failed:", err);
        generateGifBtn.disabled = false;
        generateText.textContent = "Error: " + err.message;
        setTimeout(() => { progressContainer.style.display = "none"; }, 3000);
    }
}

init();
