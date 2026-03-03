function blink() {
  const iris = document.querySelectorAll(".iris");

  if (!iris) {
    console.warn(".iris not found — retrying...");
    setTimeout(blink, 100);
    return;
  }

  gsap.to(iris, {
    duration: 0.1,
    scaleY: 0,
    transformOrigin: "center bottom",
    yoyo: true,
    repeat: 1,
    onComplete: function () {
      gsap.delayedCall(Math.random() + 0.8, blink);
    },
  });
}

blink();

Draggable.create(".drag", {
  type: "x,y",
});
