/* Stardew Birthday — script.js
   Customize the `gifts` array below.
   Each gift: {id, title, revealText, iconHtml, revealType}
   revealType can be: "text", "photo", "final"
*/

const ENERGY_MAX = 100;
const COST = 20;
const HEART_PER_OPEN = 2;
const HEART_MAX = 10; // final at 10 hearts
const STORAGE_KEY = 'stardew-bday-save-v1';

const gifts = [
  { id: 1, title: "Dinner Date", revealText: "Dinner at your favourite spot tonight! I'll pick you up at 7.", iconHtml: "🍽️", revealType: "text" },
  { id: 2, title: "New Game", revealText: "A new game for cozy weekends. (Check the box in my bag!)", iconHtml: "🎮", revealType: "text" },
  { id: 3, title: "Chill Playlist", revealText: "A playlist I made just for you (link in the note).", iconHtml: "🎧", revealType: "text" },
  { id: 4, title: "Memory Photo", revealText: "Here’s one of our favourite memories.", iconHtml: "🖼️", revealType: "photo", photoPath: "assets/photo-memory.jpg" },
  { id: 5, title: "The Finale", revealText: "Open this when your hearts reach 10...", iconHtml: "💍", revealType: "final", photoPath: "assets/final-image.jpg" }
];

// App state
let state = {
  energy: ENERGY_MAX,
  hearts: 0,
  opened: {} // map id -> true
};

// DOM
const energyDisplay = document.getElementById('energyDisplay');
const heartsDisplay = document.getElementById('heartIcons');
const inventoryEl = document.getElementById('inventory');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalActions = document.getElementById('modalActions');
const resetBtn = document.getElementById('resetBtn');
const greetingText = document.getElementById('greetingText');

// init
function init() {
  loadState();
  renderInventory();
  updateUI();
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try{
      const parsed = JSON.parse(raw);
      if(parsed && typeof parsed === 'object'){
        state = parsed;
      }
    }catch(e){ console.warn("Failed to parse save:", e) }
  }
}
function resetState(){
  if(confirm("Reset progress? This will close all boxes.")){
    state = { energy: ENERGY_MAX, hearts: 0, opened: {} };
    saveState();
    renderInventory();
    updateUI();
    greetingText.textContent = "All set! Ready to celebrate 🎉";
  }
}

// render inventory UI
function renderInventory(){
  inventoryEl.innerHTML = '';
  gifts.forEach(g => {
    const box = document.createElement('div');
    box.className = 'box ' + (state.opened[g.id] ? 'opened' : 'locked');
    box.dataset.id = g.id;
    if(state.opened[g.id]){
      box.innerHTML = `<div class="icon">${g.iconHtml}</div><div class="label">${g.title}</div>`;
    } else {
      // pixel mystery chest (simple)
      box.innerHTML = `
        <div class="mystery">❓</div>
        <div class="label">Mystery</div>
      `;
    }
    box.addEventListener('click', onBoxClicked);
    inventoryEl.appendChild(box);
  });
}

// UI update
function updateUI(){
  energyDisplay.textContent = `Energy: ${state.energy}`;
  // hearts display as icons
  const heartsCount = Math.min(state.hearts, HEART_MAX);
  const filled = '❤️'.repeat(Math.floor(heartsCount/2));
  const emptyCount = Math.ceil((HEART_MAX - heartsCount)/2);
  const empty = '🤍'.repeat(Math.max(0, 5 - Math.floor(heartsCount/2)));
  heartsDisplay.textContent = filled + empty;
  saveState();
}

// interactions
function onBoxClicked(e){
  const id = Number(e.currentTarget.dataset.id);
  const gift = gifts.find(g => g.id === id);
  if(!gift) return;

  if(state.opened[id]){
    // already opened: show its reveal again
    showReveal(gift);
    return;
  }

  if(state.energy < COST){
    showModal(`<strong>Not enough Energy</strong><br>You need ${COST} Energy to open this box.`, [{text:'OK', action: closeModal}]);
    return;
  }

  // confirm
  showModal(
    `<strong>Farmer Laka:</strong><br>"That box looks heavy! It will cost ${COST} Energy to open it. Proceed?"`,
    [
      {text:'No', action: closeModal},
      {text:'Yes', action: () => { closeModal(); openBox(gift); }}
    ]
  );
}

function openBox(gift){
  // deduct energy
  state.energy = Math.max(0, state.energy - COST);
  // mark opened
  state.opened[gift.id] = true;
  // increment hearts
  state.hearts = Math.min(HEART_MAX, state.hearts + HEART_PER_OPEN);

  renderInventory();
  updateUI();

  // reveal
  showReveal(gift);

  // check milestone events after reveal
  setTimeout(() => {
    if(state.hearts >= 10){
      // grand finale unlocked automatically when hearts >=10
      showFinalEvent();
    } else if(state.hearts >= 8){
      showPhotoEvent();
    } else if(state.hearts >= 4){
      showReasonsEvent();
    }
  }, 250);
}

function showReveal(gift){
  if(gift.revealType === 'text'){
    showModal(`<strong>${gift.title}</strong><br><br>${gift.revealText}`, [{text:'Close', action: closeModal}]);
  } else if(gift.revealType === 'photo'){
    const html = `<strong>${gift.title}</strong><br><br>
      <div style="text-align:center">
        <img src="${gift.photoPath}" alt="${gift.title}" style="max-width:100%;border-radius:8px;border:3px solid rgba(255,255,255,0.03)"/>
      </div>
      <p style="margin-top:8px">${gift.revealText}</p>`;
    showModal(html, [{text:'Close', action: closeModal}]);
  } else if(gift.revealType === 'final'){
    // final is special: show only if hearts >= HEART_MAX
    if(state.hearts < HEART_MAX){
      showModal(`<strong>Locked</strong><br>This box unlocks when your hearts reach ${HEART_MAX}. Keep opening other boxes!`, [{text:'OK', action: closeModal}]);
      return;
    }
    const html = `<strong>${gift.title}</strong><br><br>
      <div style="text-align:center">
        <img src="${gift.photoPath}" alt="${gift.title}" style="max-width:100%;border-radius:8px;border:3px solid rgba(255,255,255,0.03)"/>
      </div>
      <p style="margin-top:8px">${gift.revealText}</p>`;
    showModal(html, [{text:'Close', action: closeModal}]);
  }
}

// milestone events
function showReasonsEvent(){
  // 5 reasons — personalize these lines!
  const reasons = [
    "You make every day feel like an adventure.",
    "Your laugh is my favorite soundtrack.",
    "You always support my silly ideas.",
    "You’re kind to people and animals.",
    "You make me want to be better — and happier."
  ];
  const html = `<strong>Sweet Event — +4 Hearts reached!</strong><br><br>
    <div style="font-family:inherit;line-height:1.4">${reasons.map((r,i)=>`<div>• ${r}</div>`).join('')}</div>`;
  showModal(html, [{text:'Aww', action: closeModal}]);
}

function showPhotoEvent(){
  // show the special photo memory
  const html = `<strong>Memory Unlocked — +8 Hearts!</strong><br><br>
    <div style="text-align:center">
      <img src="assets/photo-memory.jpg" alt="Memory" style="max-width:100%;border-radius:8px;border:3px solid rgba(255,255,255,0.03)"/>
    </div>
    <p style="margin-top:8px">One of my favourite photos of us 💚</p>`;
  showModal(html, [{text:'Nice', action: closeModal}]);
}

function showFinalEvent(){
  const html = `<strong>Grand Finale — 10 Hearts!</strong><br><br>
    <div style="text-align:center">
      <img src="assets/final-image.jpg" alt="Final" style="max-width:100%;border-radius:8px;border:3px solid rgba(255,255,255,0.03)"/>
    </div>
    <p style="margin-top:8px">Happy Birthday, my love. <br><br>
      [Write your full heartfelt letter here — the space is yours to customize!]</p>`;
  showModal(html, [{text:'I love it', action: closeModal}]);
}

// modal helpers
function showModal(htmlContent, actions = [{text:'Close', action: closeModal}]){
  modalContent.innerHTML = htmlContent;
  modalActions.innerHTML = '';
  actions.forEach(a => {
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = a.text;
    b.addEventListener('click', a.action);
    modalActions.appendChild(b);
  });
  modal.classList.remove('hidden');
}
function closeModal(){
  modal.classList.add('hidden');
}

// events
resetBtn.addEventListener('click', resetState);
modal.addEventListener('click', (e) => {
  if(e.target === modal) closeModal();
});

// init app
init();

/* Optional: Save greeting text dynamically to personalize
   greetingText.textContent = "Happy Birthday, [His Name]!";
*/
