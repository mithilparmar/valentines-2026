const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const confetti = document.getElementById("confetti");
const dateChoices = document.getElementById("dateChoices");
const choiceResult = document.getElementById("choiceResult");
const yesFlow = document.getElementById("yesFlow");
let confettiTimer = null;
const gameBoard = document.getElementById("gameBoard");
const gameStatus = document.getElementById("gameStatus");
const questionSection = document.getElementById("questionSection");
const mainContent = document.getElementById("mainContent");
const gameSection = document.getElementById("game");
const winOverlay = document.getElementById("winOverlay");
const ctaStack = document.getElementById("ctaStack");
const introScreen = document.getElementById("introScreen");
const introCount = document.getElementById("introCount");

const yesBaseStyles = (() => {
  const styles = window.getComputedStyle(yesBtn);
  const fontSize = parseFloat(styles.fontSize);
  const padY = parseFloat(styles.paddingTop);
  const padX = parseFloat(styles.paddingLeft);
  return { fontSize, padY, padX };
})();

let noClicks = 0;
const noPhrases = [
  "Are you sure?",
  "Really sure??",
  "Are you positive?",
  "Pookie please...",
  "Just think about it!",
  "If you say no, I will be really sad...",
  "I will be very sad...",
  "I will be very very very sad...",
  "Ok fine, I will stop asking...",
  "Just kidding, say yes please! ❤️",
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function burstConfetti(count = 40) {
  const colors = ["#ff3c7d", "#ffb347", "#6ea8ff", "#7bed9f", "#f78fb3"];

  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.style.left = `${randomBetween(0, 100)}vw`;
    piece.style.top = `${randomBetween(-60, -20)}px`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--rot", `${randomBetween(0, 360)}deg`);
    piece.style.animationDelay = "0s";
    piece.style.animationDuration = `${randomBetween(2.8, 4.2)}s`;
    piece.style.width = `${randomBetween(8, 14)}px`;
    piece.style.height = `${randomBetween(10, 18)}px`;
    piece.addEventListener("animationend", () => {
      piece.remove();
    });
    confetti.appendChild(piece);
  }
}

function runIntro() {
  if (!introScreen) return;
  document.body.classList.add("intro-active");
  const lines = [
    "Psst, Shuchi… I made a tiny game for you.",
    "No skipping ahead.",
    "Match the pairs to unlock the surprise.",
    "It’s quick, I promise.",
    "Tap to start.",
  ];
  const lineEl = introScreen.querySelector(".intro-line");
  let index = 0;

  const revealNext = () => {
    if (!lineEl) return;
    if (index >= lines.length) {
      introScreen.classList.add("is-hidden");
      document.body.classList.remove("intro-active");
      if (gameSection) {
        gameSection.classList.add("is-visible");
      }
      return;
    }
    lineEl.classList.add("is-fade");
    setTimeout(() => {
      lineEl.textContent = lines[index];
      lineEl.classList.remove("is-fade");
      lineEl.classList.add("is-visible");
      index += 1;
    }, 380);
  };

  const countdown = ["3", "2", "1"];
  let countIndex = 0;
  const showCount = () => {
    if (!introCount) {
      revealNext();
      introScreen.addEventListener("click", () => revealNext());
      return;
    }
    introCount.textContent = countdown[countIndex];
    introCount.classList.add("is-visible");
    setTimeout(() => {
      introCount.classList.remove("is-visible");
    }, 900);

    countIndex += 1;
    if (countIndex < countdown.length) {
      setTimeout(showCount, 1000);
    } else {
      setTimeout(() => {
        revealNext();
        introScreen.addEventListener("click", () => revealNext());
      }, 1000);
    }
  };

  showCount();
}

noBtn.addEventListener("click", () => {
  noClicks += 1;
  const phraseIndex = Math.min(noClicks - 1, noPhrases.length - 1);
  noBtn.textContent = noPhrases[phraseIndex];
  const sizeScale = Math.pow(1.3, noClicks);
  yesBtn.style.transform = "none";
  yesBtn.style.fontSize = `${yesBaseStyles.fontSize * sizeScale}px`;
  yesBtn.style.padding = `${yesBaseStyles.padY * sizeScale}px ${yesBaseStyles.padX * sizeScale}px`;
  const cta = document.querySelector(".cta");
  if (cta) {
    const gap = 22 + noClicks * 10;
    cta.style.gap = `${gap}px`;
  }
  if (ctaStack) {
    const stackGap = 12 + noClicks * 8;
    ctaStack.style.gap = `${stackGap}px`;
  }

  if (noClicks > noPhrases.length) {
    document.body.classList.add("full-yes");
  }
});

yesBtn.addEventListener("click", () => {
  if (questionSection) {
    questionSection.classList.add("fade-out");
    setTimeout(() => {
      questionSection.classList.add("is-hidden");
    }, 600);
  }

  if (yesFlow) {
    yesFlow.classList.remove("is-hidden");
    yesFlow.classList.add("fade-in");
  }

  if (mainContent) {
    mainContent.classList.remove("is-hidden");
  }

  document.body.classList.remove("show-question");
  document.body.classList.add("show-yes");
  window.scrollTo({ top: 0, behavior: "instant" });

  if (!confettiTimer) {
    burstConfetti(30);
    confettiTimer = setInterval(() => burstConfetti(30), 700);
  }
});

// Confetti container kept in case you'd like it later.


dateChoices.addEventListener("click", (event) => {
  const target = event.target.closest(".choice");
  if (!target) return;

  dateChoices.querySelectorAll(".choice").forEach((btn) => {
    btn.classList.remove("active");
  });
  target.classList.add("active");
  choiceResult.textContent = `I will plan this: ${target.textContent}`;
});


function shuffleCards() {
  const cards = Array.from(gameBoard.children);
  cards.sort(() => Math.random() - 0.5);
  cards.forEach((card) => gameBoard.appendChild(card));
}

let flippedCards = [];
let matchedPairs = 0;
const totalPairs = 8;

function resetFlips() {
  flippedCards.forEach((card) => card.classList.remove("is-flipped"));
  flippedCards = [];
}

function onCardClick(event) {
  const card = event.target.closest(".game-card");
  if (!card || card.classList.contains("is-flipped")) return;
  if (card.classList.contains("is-matched")) return;
  if (flippedCards.length === 2) return;

  card.classList.add("is-flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    const [first, second] = flippedCards;
    const isMatch = first.dataset.id === second.dataset.id;

    setTimeout(() => {
      if (isMatch) {
        first.classList.add("is-matched");
        second.classList.add("is-matched");
        matchedPairs += 1;
        gameStatus.textContent = `Pairs found: ${matchedPairs} / ${totalPairs}`;
        flippedCards = [];
      } else {
        resetFlips();
      }

      if (matchedPairs === totalPairs) {
        winOverlay.classList.remove("is-hidden");
        setTimeout(() => {
          winOverlay.classList.add("is-fading");
        }, 4500);

        setTimeout(() => {
          winOverlay.classList.add("is-hidden");
          winOverlay.classList.remove("is-fading");
          if (gameSection) {
            gameSection.classList.remove("is-visible");
            gameSection.classList.add("fade-out");
          }
          questionSection.classList.remove("locked");
          questionSection.classList.remove("is-hidden");
          document.body.classList.add("show-question");

          setTimeout(() => {
            if (gameSection) {
              gameSection.classList.add("is-hidden");
            }
          }, 600);
        }, 5200);
      }
    }, 450);
  }
}

gameBoard.addEventListener("click", onCardClick);
shuffleCards();

runIntro();
