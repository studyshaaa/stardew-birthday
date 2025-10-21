const gifts = [
  { id: 1, title: "Today's Pics", revealText: "Since you missed today pics, here's some for you", iconHtml: "📸", revealType: "photo", photoPath: "assets/01.jpg" },
  { id: 2, title: "Coupon", revealText: "A Free Coupon of anything for you (nothing risky and can't fly to you tho💔)", iconHtml: "🎫", revealType: "text" },
  { id: 3, title: "Laid back day", revealText: "A full day play with you, a day of your choosing", iconHtml: "🎮", revealType: "text" },
  { id: 4, title: "Dump", revealText: "Here’s another one", iconHtml: "🖼", revealType: "photo", photoPath: "assets/02.jpg" },
  { id: 5, title: "The Finale", revealText: "Open this when your hearts reach 10... lalala", iconHtml: "💍", revealType: "final", photoPath: "assets/03.jpg" }
];

let energy = 100;
let hearts = 0;

const energyDisplay = document.getElementById("energy");
const heartsDisplay = document.getElementById("hearts");
const boxesContainer = document.getElementById("boxes");
const revealBox = document.getElementById("reveal");
const revealTitle = document.getElementById("revealTitle");
const revealText = document.getElementById("revealText");
const revealPhoto = document.getElementById("revealPhoto");
const closeReveal = document.getElementById("closeReveal");
const resetBtn = document.getElementById("reset");

function renderBoxes() {
  boxesContainer.innerHTML = "";
  gifts.forEach(gift => {
    const div = document.createElement("div");
    div.className = "box";
    div.dataset.id = gift.id;
    div.innerHTML = `${gift.iconHtml}<br>${gift.title}`;
    boxesContainer.appendChild(div);
  });
}

function updateStats() {
  energyDisplay.textContent = energy;
  heartsDisplay.textContent = hearts;
}

boxesContainer.addEventListener("click", e => {
  const box = e.target.closest(".box");
  if (!box) return;

  const id = parseInt(box.dataset.id);
  const gift = gifts.find(g => g.id === id);

  if (energy < 20) {
    alert("You're out of energy! 💔");
    return;
  }

  energy -= 20;
  hearts += 2;
  updateStats();

  showGift(gift);
  box.classList.add("hidden");
});

function showGift(gift) {
  revealTitle.textContent = gift.title;
  revealText.textContent = gift.revealText;

  if (gift.revealType === "photo" || gift.revealType === "final") {
    revealPhoto.src = gift.photoPath;
    revealPhoto.classList.remove("hidden");
  } else {
    revealPhoto.classList.add("hidden");
  }

  revealBox.classList.remove("hidden");
}

closeReveal.addEventListener("click", () => {
  revealBox.classList.add("hidden");
});

resetBtn.addEventListener("click", () => {
  energy = 100;
  hearts = 0;
  updateStats();
  renderBoxes();
});

renderBoxes();
updateStats();
