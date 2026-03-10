// VARS
const DPR = window.devicePixelRatio;
const colors = [
['#EC008C', '#f957b6'],
['#EF4136', '#ff7972'],
['yellow', '#fff'],
['lime', '#7aff7a'],
['#27AAE1', '#5ec8f2'],
["#662D91", '#a158d8']];

const tau = Math.PI * 2;
const start = Math.PI; // Start position
const finish = .5; // Finish (in % of circle "tau" basically ending at Math.PI * 2)
const inc = .002; // How much "percent" to increase on each frame, higher is faster
const rainbowHeight = .5; // of view height
const arcStagger = .05; // in %
const sparklesInPerStripe = 3;
const slideStripeIndex = 1; // 0=pink outer stripe, 1=red stripe
const slideUseArcPosition = true; // true: follow arc, false: use manual XY
const slideManualX = -30; // used when slideUseArcPosition is false
const slideManualY = 260; // used when slideUseArcPosition is false
const slideAngleOffsetDeg = 90; // tweak this for a different slide image angle
const slideScale = 0.75; // 1 = original size, 0.8 smaller, 1.3 bigger
const slideOffsetX = 90; // move right (+) / left (-) in px
const slideOffsetY = 0; // move down (+) / up (-) in px
const slideAppearAtPercent = 0; // when slide image becomes visible
const slideMoveStartPercent = 0; // when slide image starts following arc
const slideArcLeadPercent = 0; // >0 starts further along arc (e.g. 0.12)
const slideSpeedMultiplier = 0.6; // <1 slower slide, >1 faster slide

// These values are tweaked to position the boy slide image
const boySlideAngleOffsetDeg = 90;
const boySlideScale = 0.72;
const boySlideOffsetX = 130;
const boySlideOffsetY = 135; 

let sparkles = [];
let radius;
let rainbowComplete = false;

const updateSlideOverlayById = (id, config, { x, y, angle } = {}) => {
  const slide = document.getElementById(id);
  if (!slide) {
    return;
  }

  const hasArcPoint = typeof x === 'number' && typeof y === 'number';
  const cssX = slideUseArcPosition && hasArcPoint ? x / DPR : slideManualX;
  const cssY = slideUseArcPosition && hasArcPoint ? y / DPR : slideManualY;
  const baseAngle = typeof angle === 'number' ? angle : start;
  const deg = baseAngle * (180 / Math.PI) + config.angleOffsetDeg;

  slide.style.left = `${cssX + config.offsetX}px`;
  slide.style.top = `${cssY + config.offsetY}px`;
  slide.style.transform = `translate(-50%, -50%) rotate(${deg}deg) scale(${config.scale})`;
};

const updateSlideOverlay = (point) => {
  updateSlideOverlayById(
    'slide-overlay',
    {
      angleOffsetDeg: slideAngleOffsetDeg,
      scale: slideScale,
      offsetX: slideOffsetX,
      offsetY: slideOffsetY,
    },
    point,
  );

  updateSlideOverlayById(
    'slide-overlay-boy',
    {
      angleOffsetDeg: boySlideAngleOffsetDeg,
      scale: boySlideScale,
      offsetX: boySlideOffsetX,
      offsetY: boySlideOffsetY,
    },
    point,
  );
};

// UTILS
const clamp = (min, max, val) => {
  return Math.min(Math.max(min, val), max);
};
const boolRandom = () => {
  return Math.round(Math.random()) ? false : true;
};

// CANVAS
const sizeCanvas = () => {
  radius = clamp(15, 50, window.innerWidth / 60 / DPR);
  const canvas = document.getElementById('rainbow');
  canvas.width = window.innerWidth * DPR;
  canvas.height = window.innerHeight * DPR;
};

// SPARKLE PROPS
const addRandom = function (lineWidth) {
  return (boolRandom() ? -1 : 1) * Math.random() * lineWidth;
};
const makeSparkle = ({ cx, cy, radiusX, radiusY, endAngle, lineWidth, color }) => {
  return {
    x: cx + radiusX * Math.cos(endAngle) + addRandom(lineWidth), // stay out in front
    y: cy + radiusY * Math.sin(endAngle) + addRandom(lineWidth),
    opacity: 1,
    color,
    rad: Math.max(radius * Math.random() * DPR, 15) };

};

// ANIMATE
function animate(percent = 0) {
  if (rainbowComplete) {
    return;
  }

  const doneAnimatingIn = percent >= finish + arcStagger * colors.length; // animating in rainbow arcs

  let width = window.innerWidth * DPR;
  let height = window.innerHeight * DPR;

  const lineWidth = height * .5 / colors.length;

  const cx = width / 2;
  const startCy = height + lineWidth * rainbowHeight + (height - colors.length * lineWidth) / 3; // Possibly simplify this... but the math is good :) 

  const startRadiusX = width / 2 + colors.length * lineWidth * 2;
  const startRadiusY = height;

  let ctx = document.getElementById('rainbow').getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = 1;
  ctx.lineWidth = lineWidth;
  let slideTrack = null;

  for (let i = colors.length - 1; i > -1; i--) {
    const [colorLine, colorSparkle] = colors[i];

    const cy = startCy + i * (lineWidth / 2 - 1); // - 1 for overlap

    // Making these "concentric" ellipses
    const radiusX = startRadiusX - i * lineWidth / 2;
    const radiusY = startRadiusY - i * lineWidth / 2;

    const endAngle = tau * (percent - i * arcStagger) + start;

    const angle = clamp(start, tau * finish + start, endAngle);

    if (i === slideStripeIndex) {
      const slidePercent = percent * slideSpeedMultiplier;
      const slideAngle = clamp(
        start,
        tau * finish + start,
        tau * (slidePercent - i * arcStagger + slideArcLeadPercent) + start,
      );

      slideTrack = {
        x: cx + radiusX * Math.cos(slideAngle),
        y: cy + radiusY * Math.sin(slideAngle),
        angle: slideAngle,
      };
    }

    // DRAW ONE OF OUR ELLIPSE LINES
    // - One color of our rainbow
    ctx.beginPath();
    ctx.strokeStyle = colorLine;
    ctx.ellipse(
    cx,
    cy,
    radiusX,
    radiusY,
    0,
    start,
    angle,
    false);

    ctx.lineCap = "round";
    ctx.stroke();
    ctx.closePath();


    if (!doneAnimatingIn) {
      // ADD: Animating in sparkles, follow the start of each color
      for (let j = 0; j < sparklesInPerStripe; j++) {
        sparkles.push(
        makeSparkle({ cx, cy, radiusX, radiusY, endAngle: angle, lineWidth, color: colorLine }));

      }
    } else {
      // ADD: Normal sparkles after animating in
      sparkles.push(makeSparkle({ cx, cy, radiusX, radiusY, endAngle: Math.random() * Math.PI + Math.PI, lineWidth, color: boolRandom() ? '#fff' : colorSparkle }));
    }
  }

  const slide = document.getElementById('slide-overlay');
  const slideBoy = document.getElementById('slide-overlay-boy');
  const hasSlide = !!slide || !!slideBoy;

  if (hasSlide) {
    const moveStart = Math.max(slideAppearAtPercent, slideMoveStartPercent);

    if (percent < slideAppearAtPercent) {
      if (slide) {
        slide.style.opacity = '0';
      }
      if (slideBoy) {
        slideBoy.style.opacity = '0';
      }
    } else if (!slideUseArcPosition) {
      if (slide) {
        slide.style.opacity = '1';
      }
      if (slideBoy) {
        slideBoy.style.opacity = '1';
      }
      updateSlideOverlay();
    } else if (percent < moveStart) {
      // Stay at manual XY until sliding starts.
      if (slide) {
        slide.style.opacity = '1';
      }
      if (slideBoy) {
        slideBoy.style.opacity = '1';
      }
      updateSlideOverlay();
    } else if (slideTrack) {
      if (slide) {
        slide.style.opacity = '1';
      }
      if (slideBoy) {
        slideBoy.style.opacity = '1';
      }
      updateSlideOverlay(slideTrack);
    }
  }

  // PAINT THE SPARKLES
  // and get next sparkles ready too
  const nextSparkles = [];
  for (let i = 0, len = sparkles.length; i < len; i++) {
    const { x, y, opacity, color, rad } = sparkles[i];
    ctx.beginPath();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.arc(x - rad, y - rad, rad, 0, Math.PI / 2);
    ctx.arc(x - rad, y + rad, rad, 3 * Math.PI / 2, 2 * Math.PI);
    ctx.arc(x + rad, y + rad, rad, Math.PI, 3 * Math.PI / 2);
    ctx.arc(x + rad, y - rad, rad, Math.PI / 2, Math.PI);
    ctx.fill();

    // Sparkles we are keeping
    if (opacity > .2 && rad > .2) {
      nextSparkles.push({
        x,
        y,
        opacity: opacity - .03,
        rad: rad - .2,
        color });

    }
  }
  sparkles = nextSparkles;

  if (!doneAnimatingIn) {
    // Animating in our rainbow
    requestAnimationFrame(function () {
      animate(percent + inc);
    });
  } else {
    // Signal that rainbow fill is complete so the loading stage can start.
    rainbowComplete = true;
    window.__rainbowDone = true;
    window.dispatchEvent(new Event('rainbow:complete'));
  }
}

sizeCanvas();
requestAnimationFrame(function () {animate();});
window.addEventListener('resize', sizeCanvas);