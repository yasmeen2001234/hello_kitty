const frames = [
  "Images/Animation/kuromi1.png",
  "Images/Animation/kuromi2.png",
  "Images/Animation/kuromi3.png",
];

let currentFrame = 0;
const kuromi = document.getElementById("kuromi");

setInterval(() => {
  currentFrame = (currentFrame + 1) % frames.length;
  kuromi.setAttribute("href", frames[currentFrame]);
}, 200);

const frames2 = [
  "Images/Animation/Boy1.png",
  "Images/Animation/Boy2.png",
  "Images/Animation/Boy3.png",
];

let currentFrame2 = 0;
const boy = document.getElementById("boy");
// Store interval ID so we can clear it from game logic
let boyIdleInterval = setInterval(() => {
  currentFrame2 = (currentFrame2 + 1) % frames2.length;
  boy.setAttribute("href", frames2[currentFrame2]);
}, 200);
// Expose a function to stop the boy's idle animation
window.stopBoyIdleAnimation = function () {
  if (boyIdleInterval) {
    clearInterval(boyIdleInterval);
    boyIdleInterval = null;
  }
};
