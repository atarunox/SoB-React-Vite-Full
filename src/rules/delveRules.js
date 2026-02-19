// Delve rules per SoB core flow.
// - Hold Back the Darkness: Roll 2D6 vs Depth threshold. On failure, advance Darkness and trigger thresholds.
// - Growing Dread: queued during delve; reveal all at Objective fight (or when explicitly triggered).

export function roll2D6() {
  return (Math.floor(Math.random()*6) + 1) + (Math.floor(Math.random()*6) + 1);
}

export function holdBackTheDarkness({ depthThreshold = 7, darknessTrack = 0, onAdvance = () => {}, onGrowingDread = () => {} } = {}) {
  const roll = roll2D6();
  const success = roll >= depthThreshold;
  if (!success) {
    // Advance Darkness by 1
    const nextTrack = darknessTrack + 1;
    onAdvance(nextTrack);
    // Example thresholds: at 3/6/9 you might add GD (you should align with your actual board/track config)
    if ([3,6,9].includes(nextTrack)) {
      onGrowingDread();
    }
    return { roll, success: false, darknessTrack: nextTrack };
  }
  return { roll, success: true, darknessTrack };
}

// Growing Dread Queue: store as ids; reveal resolves and returns a resolved list
export function queueGrowingDread(queue, card) {
  return [...queue, card];
}

export function revealGrowingDread(queue) {
  // return the list as revealed in order and clear the queue
  return { revealed: [...queue], remaining: [] };
}
