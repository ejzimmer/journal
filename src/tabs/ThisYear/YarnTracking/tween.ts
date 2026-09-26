export type Tween = {
  from: number;
  to: number;
  elapsed: number;
  duration: number;
};

const easeOut = (progress: number) => 1 - (1 - progress) ** 3;

export const createTween = (value: number, duration: number): Tween => ({
  from: value,
  to: value,
  elapsed: duration,
  duration,
});

export const getTweenValue = ({ from, to, elapsed, duration }: Tween) =>
  from + (to - from) * easeOut(Math.min(elapsed / duration, 1));

export const isTweenRunning = ({ elapsed, duration }: Tween) =>
  elapsed < duration;

export const retargetTween = (tween: Tween, to: number): Tween =>
  to === tween.to
    ? tween
    : { ...tween, from: getTweenValue(tween), to, elapsed: 0 };

export const advanceTween = (tween: Tween, seconds: number): Tween => ({
  ...tween,
  elapsed: Math.min(tween.elapsed + seconds, tween.duration),
});

export const finishTween = (tween: Tween): Tween => ({
  ...tween,
  elapsed: tween.duration,
});
