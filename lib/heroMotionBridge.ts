/**
 * HeroScene lerps toward targetMotionScale so the home pager can calm the hero off section 0.
 */

export const heroMotionBridge = {
  targetMotionScale: 1,
};

export function setHeroTargetMotionScale(scale: number) {
  heroMotionBridge.targetMotionScale = scale;
}
