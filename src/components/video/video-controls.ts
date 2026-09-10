import type { VideoPlayer } from "expo-video";

type ControlledPlayer = Pick<VideoPlayer, "currentTime" | "duration" | "playing" | "status" | "pause" | "play" | "replay">;

export function getVideoDuration(current: number, previous = 0): number {
  return Number.isFinite(current) && current > 0 ? current : previous;
}

export function getVideoControlState(status: VideoPlayer["status"], hasEnded: boolean, isPlaying: boolean) {
  return {
    disabled: status === "error" || (!hasEnded && status !== "readyToPlay"),
    isLoading: !hasEnded && (status === "idle" || status === "loading"),
    showPause: isPlaying && !hasEnded,
  };
}

export function getVideoSeekTarget(currentTime: number, duration: number, offset: -10 | 10): number | null {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) {
    return null;
  }

  return Math.max(0, Math.min(duration, currentTime + offset));
}

export function createVideoControlActions(player: ControlledPlayer, now = Date.now) {
  let lastActionAt = -Infinity;

  function canAct(hasEnded = false) {
    const timestamp = now();
    if (getVideoControlState(player.status, hasEnded, player.playing).disabled || timestamp - lastActionAt < 300) {
      return false;
    }
    lastActionAt = timestamp;
    return true;
  }

  return {
    resetAfterEnd() {
      player.pause();
      player.currentTime = 0;
      lastActionAt = -Infinity;
    },
    seek(offset: -10 | 10, knownDuration = 0): number | null {
      const target = getVideoSeekTarget(player.currentTime, getVideoDuration(player.duration, knownDuration), offset);
      if (target === null || target === player.currentTime || !canAct()) {
        return null;
      }
      player.currentTime = target;
      return target;
    },
    toggle(hasEnded: boolean): boolean {
      if (!canAct(hasEnded)) {
        return false;
      }
      if (hasEnded || (player.duration > 0 && player.currentTime >= player.duration)) {
        player.replay();
      } else if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
      return true;
    },
  };
}
