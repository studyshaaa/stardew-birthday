const ENERGY_MAX = 100;
const COST = 20;
const HEART_PER_OPEN = 2;
const HEART_MAX = 10;
const STORAGE_KEY = 'stardew-bday-save-v2';

const gifts = [
  { id: 1, title: "Today's Pics", revealText: "Since you missed today pics, here's some for you", iconHtml: "📸", revealType: "photo", photoPath: "assets/1761012744811.jpg" },
  { id: 2, title: "Coupon", revealText: "A Free Coupon of anything for you (nothing risky and cant fly to you tho💔)", iconHtml: "🎫", revealType: "text" },
  { id: 3, title: "Laid Back Day", revealText: "A full day play with you, a day of your choosing", iconHtml: "🎮", revealType: "text" },
  { id: 4, title: "Dump", revealText: "Here’s another one", iconHtml: "🖼️", revealType: "photo", photoPath: "assets/IMG-20250728-WA0061.jpg" },
  { id: 5, title: "The Finale", revealText: "Open this when your hearts reach 10...", iconHtml: "💍", revealType: "final", photoPath: "assets/final.jpg" }
];

let state = { energy: ENERGY_MAX, hearts: 0, opened: {} };

const energyDisplay = document.getElementById('energyDisplay');
const heartsDisplay = document.getElementById('heartIcons');
const inventoryEl = document.getElementById('inventory');
const popUp = document.getElementById('modal');
const popUpContent = document.getElementById('modalContent');
const popUpActions = document.getElementById('modalActions');
const resetBtn = document.getElementById('resetBtn');
const sweetEventBtn = document.getElementById('sweetEventBtn');
const greetingText = document.getElementById('greetingText');

function init() {
  loadState();
  renderInventory();
  updateUI();
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try{ state = JSON.parse(raw) || state; }catch(e){}
  }
}
function resetState(){
  if(confirm("Reset progress?")){
    state = { energy: ENERGY_MAX, hearts: 0, opened: {} };
    saveState();
    renderInventory();
    updateUI();
    greetingText.textContent = "All set! Ready to celebrate 🎉";
  }
}

function renderInventory(){
  inventoryEl.innerHTML = '';
  gifts.forEach(g => {
    const box = document.createElement('div');
    box.className = 'box ' + (state.opened[g.id] ? 'opened' : 'locked');
    box.dataset.id = g.id;
    box.innerHTML = state.opened[g.id]
      ? `<div class="icon">${g.iconHtml}</div><div class="label">${g.title}</div>`
      : `<div class="mystery">❓</div><div class="label">Mystery</div>`;
    box.addEventListener('click', onBoxClicked);
    inventoryEl.appendChild(box);
  });
}

function updateUI(){
  energyDisplay.textContent = `Energy: ${state.energy}`;
  const heartsCount = Math.min(state.hearts, HEART_MAX);
  const filled = '❤️'.repeat(Math.floor(heartsCount/2));
  const empty = '🤍'.repeat(Math.max(0, 5 - Math.floor(heartsCount/2)));
  heartsDisplay.textContent = filled + empty;

    // toggle Sweet Event button
  if(state.hearts >= 4){ sweetEventBtn.classList.remove('hidden'); }
  else { sweetEventBtn.classList.add('hidden'); }

  saveState();
}

function onBoxClicked(e){
  const id = Number(e.currentTarget.dataset.id);
  const gift = gifts.find(g => g.id === id);
  if(!gift) return;
  if(state.opened[id]) return showReveal(gift);
  if(state.energy < COST)
    return showModal(`Not enough energy! Need ${COST} Energy.`, [{text:'OK',action:closeModal}]);

  showModal(
    `Open this box for ${COST} Energy?`,
    [
      {text:'No',action:closeModal},
      {text:'Yes',action:()=>{closeModal(); openBox(gift);}}
    ]
  );
}

function openBox(gift){
  state.energy = Math.max(0, state.energy - COST);
  state.opened[gift.id] = true;
  state.hearts = Math.min(HEART_MAX, state.hearts + HEART_PER_OPEN);
  renderInventory();
  updateUI();
  showReveal(gift);
  setTimeout(() => {
    if(state.hearts >= 10) showFinalEvent();
  }, 200);
}

function showReveal(gift){
  let html = `<strong>${gift.title}</strong><br><br>${gift.revealText}`;
  if(gift.revealType === 'photo' || gift.revealType === 'final'){
    html = `<strong>${gift.title}</strong><br><br>
      <div style="text-align:center">
        <img src="${gift.photoPath}" alt="${gift.title}" />
      </div>
      <p style="margin-top:8px">${gift.revealText}</p>`;
  }
  showModal(html, [{text:'Close',action:closeModal}]);
}

function showReasonsEvent(){
  const reasons = [
    "You make me want to be better and happier",
    "I love your laugh and your voice",
    "Your eyes calm me down, and i want to see it everyday",
    "You protect me from the bad stuff",
    "You the only one that successfully convince me to start new things"
  ];
  const html = `<strong>Sweet Event — +4 Hearts!</strong><br><br>
    <div style="font-family:inherit;line-height:1.4">
      ${reasons.map(r=>`<div>• ${r}</div>`).join('')}
    </div>`;
  showModal(html, [{text:'Aww',action:closeModal}]);
}

function showFinalEvent(){
  const html = `<strong>Grand Finale — 10 Hearts!</strong><br><br>
    <div style="text-align:center">
      <img src="assets/IMG-20250728-WA0061.jpg" alt="Final" />
    </div>
    <p style="margin-top:8px">Happy Birthday, my love 💙💜</p>`;
  showModal(html, [{text:'I love it',action:closeModal}]);
}

function showModal(html, actions=[{text:'Close',action:closeModal}]){
  modalContent.innerHTML = html;
  modalActions.innerHTML = '';
  actions.forEach(a=>{
    const b=document.createElement('button');
    b.className='btn';
    b.textContent=a.text;
    b.addEventListener('click',a.action);
    modalActions.appendChild(b);
  });
  modal.classList.remove('hidden');
}
function closeModal(){ modal.classList.add('hidden'); }

// Events
resetBtn.addEventListener('click', resetState);
sweetEventBtn.addEventListener('click', showReasonsEvent);
modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });

// Init
init();
