function blink() {
  gsap.to(".iris", {
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

let draggable = Draggable.create(".drag", {
  type: "x,y",
}); //draggable plugin code
