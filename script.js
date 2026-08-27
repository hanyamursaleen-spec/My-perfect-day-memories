/* ===== My Perfect Day Memories — journal logic ===== */

const STORAGE_KEY = "perfect-day-journal-pages";

const pageTitles = [
  "good morning ✿", "little joys", "sweet bites", "adventures today",
  "golden hour", "goodnight ☾"
];

const cornerStickers = ["🌷","🍓","🦋","🌸","⭐","🍯","🧁","🍄","🌈","🎀"];

let pages = loadPages();
let currentIndex = 0;
let isFlipping = false;

const bookEl = document.getElementById("book");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const dotsEl = document.getElementById("page-dots");
const openBtn = document.getElementById("open-btn");
const closeBtn = document.getElementById("close-btn");
const coverScreen = document.getElementById("cover-screen");
const bookScreen = document.getElementById("book-screen");

/* ---------- data ---------- */
function loadPages(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved && saved.length) return saved;
  }catch(e){}
  return pageTitles.map(() => ({ photo: null, caption: "" }));
}

function savePages(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
}

/* ---------- render ---------- */
function render(){
  bookEl.innerHTML = "";

  pages.forEach((pageData, i) => {
    const pageEl = buildPageEl(pageData, i);
    if(i === currentIndex) pageEl.classList.add("current");
    else pageEl.classList.add("stacked");
    pageEl.style.zIndex = pages.length - Math.abs(i - currentIndex);
    if(i < currentIndex) pageEl.style.display = "none"; // already turned
    bookEl.appendChild(pageEl);
  });

  renderDots();
  prevBtn.disabled = currentIndex === 0;
}

function buildPageEl(pageData, index){
  const pageEl = document.createElement("div");
  pageEl.className = "page";
  pageEl.dataset.index = index;

  const ring = document.createElement("div");
  ring.className = "page-ring";
  pageEl.appendChild(ring);

  // decorative corner sticker, stable per page
  const sticker = document.createElement("span");
  sticker.className = "page-sticker";
  sticker.textContent = cornerStickers[index % cornerStickers.length];
  sticker.style.top = "10px";
  sticker.style.right = "14px";
  pageEl.appendChild(sticker);

  const header = document.createElement("div");
  header.className = "page-header";
  header.innerHTML = `
    <span class="page-title">${pageTitles[index % pageTitles.length]}</span>
    <span class="page-number">page ${index + 1} of ${pages.length}</span>
  `;
  pageEl.appendChild(header);

  // photo slot
  const photoSlot = document.createElement("div");
  photoSlot.className = "photo-slot";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";

  if(pageData.photo){
    const img = document.createElement("img");
    img.src = pageData.photo;
    photoSlot.appendChild(img);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-photo";
    removeBtn.textContent = "✕";
    removeBtn.title = "Remove photo";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      pageData.photo = null;
      savePages();
      render();
    });
    photoSlot.appendChild(removeBtn);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "placeholder";
    placeholder.innerHTML = `<span class="plus">＋</span>add a photo`;
    photoSlot.appendChild(placeholder);
  }

  photoSlot.appendChild(fileInput);
  photoSlot.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      pageData.photo = ev.target.result;
      savePages();
      render();
    };
    reader.readAsDataURL(file);
  });

  pageEl.appendChild(photoSlot);

  // caption
  const captionArea = document.createElement("div");
  captionArea.className = "caption-area";
  captionArea.innerHTML = `<span class="caption-label">caption ✎</span>`;

  const captionInput = document.createElement("textarea");
  captionInput.className = "caption-input";
  captionInput.rows = 2;
  captionInput.placeholder = "write a little memory here...";
  captionInput.value = pageData.caption || "";
  captionInput.addEventListener("input", () => {
    pageData.caption = captionInput.value;
    savePages();
  });
  captionArea.appendChild(captionInput);
  pageEl.appendChild(captionArea);

  // last page: add-page button
  if(index === pages.length - 1){
    const lastActions = document.createElement("div");
    lastActions.className = "last-page-actions";
    const addBtn = document.createElement("button");
    addBtn.className = "add-page-btn";
    addBtn.textContent = "+ add another page";
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      pages.push({ photo: null, caption: "" });
      savePages();
      currentIndex = pages.length - 2;
      render();
      setTimeout(flipNext, 50);
    });
    lastActions.appendChild(addBtn);
    pageEl.appendChild(lastActions);
  }

  return pageEl;
}

function renderDots(){
  dotsEl.innerHTML = "";
  pages.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "dot" + (i === currentIndex ? " active" : "");
    dotsEl.appendChild(dot);
  });
}

/* ---------- flipping ---------- */
function flipNext(){
  if(isFlipping || currentIndex >= pages.length - 1) return;
  isFlipping = true;
  const currentPageEl = bookEl.querySelector(`.page[data-index="${currentIndex}"]`);
  currentPageEl.classList.add("flipping");

  setTimeout(() => {
    currentIndex += 1;
    isFlipping = false;
    render();
  }, 650);
}

function flipPrev(){
  if(isFlipping || currentIndex <= 0) return;
  currentIndex -= 1;
  render();
}

nextBtn.addEventListener("click", flipNext);
prevBtn.addEventListener("click", flipPrev);

/* ---------- open / close ---------- */
openBtn.addEventListener("click", () => {
  coverScreen.classList.add("hidden");
  bookScreen.classList.remove("hidden");
  currentIndex = 0;
  render();
});

closeBtn.addEventListener("click", () => {
  bookScreen.classList.add("hidden");
  coverScreen.classList.remove("hidden");
});

/* keyboard support */
document.addEventListener("keydown", (e) => {
  if(bookScreen.classList.contains("hidden")) return;
  if(e.key === "ArrowRight") flipNext();
  if(e.key === "ArrowLeft") flipPrev();
});

render();
