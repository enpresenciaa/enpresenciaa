import { describe, expect, test } from "bun:test";

import { createVideoControlActions, getVideoControlState, getVideoDuration, getVideoSeekTarget } from "./video-controls.ts";

function setup(overrides = {}) {
  const calls = [];
  let now = 1000;
  const player = {
    currentTime: 20,
    duration: 60,
    playing: false,
    status: "readyToPlay",
    pause() { calls.push("pause"); player.playing = false; },
    play() { calls.push("play"); player.playing = true; },
    replay() { calls.push("replay"); player.currentTime = 0; player.playing = true; },
    ...overrides,
  };
  return { actions: createVideoControlActions(player, () => now), advance: ms => { now += ms; }, calls, player };
}

describe("custom video controls", () => {
  test("moves exactly ten seconds and clamps both boundaries", () => {
    expect(getVideoSeekTarget(25, 60, -10)).toBe(15);
    expect(getVideoSeekTarget(25, 60, 10)).toBe(35);
    expect(getVideoSeekTarget(3, 60, -10)).toBe(0);
    expect(getVideoSeekTarget(55, 60, 10)).toBe(60);
  });

  test("ignores unknown, invalid and live durations", () => {
    for (const duration of [0, -1, Number.NaN, Infinity]) {
      expect(getVideoSeekTarget(5, duration, 10)).toBeNull();
    }
    expect(getVideoSeekTarget(Number.NaN, 60, -10)).toBeNull();
  });

  test("play and pause follow the engine, including external pauses", () => {
    const { actions, advance, calls, player } = setup();
    expect(actions.toggle(false)).toBe(true);
    advance(300);
    actions.toggle(false);
    advance(300);
    player.playing = false;
    actions.toggle(false);
    expect(calls).toEqual(["play", "pause", "play"]);
  });

  test("rapid taps send only one native command", () => {
    const { actions, advance, calls, player } = setup();
    actions.toggle(false);
    expect(actions.toggle(false)).toBe(false);
    expect(actions.seek(10)).toBeNull();
    expect(calls).toEqual(["play"]);
    expect(player.currentTime).toBe(20);
    advance(300);
    expect(actions.seek(10)).toBe(30);
    expect(player.currentTime).toBe(30);
  });

  test("loading, idle and errors block all native commands", () => {
    for (const status of ["idle", "loading", "error"]) {
      const { actions, calls, player } = setup({ status });
      expect(actions.toggle(false)).toBe(false);
      expect(actions.seek(-10)).toBeNull();
      expect(player.currentTime).toBe(20);
      expect(calls).toEqual([]);
    }
  });

  test("an ended video starts again only on an explicit play action", () => {
    for (const currentTime of [0, 60]) {
      const { actions, calls, player } = setup({ currentTime });
      expect(calls).toEqual([]);
      actions.toggle(true);
      expect(calls).toEqual(["replay"]);
      expect(player.currentTime).toBe(0);
    }
  });

  test("the final seek stays within duration and allows rewinding", () => {
    const { actions, advance, player } = setup({ currentTime: 57 });
    expect(actions.seek(10)).toBe(60);
    advance(300);
    expect(actions.seek(10)).toBeNull();
    expect(actions.seek(-10)).toBe(50);
    expect(player.currentTime).toBe(50);
  });

  test("unknown duration disables seeking without preventing playback", () => {
    const { actions, calls } = setup({ duration: 0 });
    expect(actions.seek(10)).toBeNull();
    expect(actions.toggle(false)).toBe(true);
    expect(calls).toEqual(["play"]);
  });

  test("late Android duration enables the forward seek after initial zero metadata", () => {
    const { actions, player } = setup({ duration: 0 });
    let duration = getVideoDuration(0);
    expect(duration).toBe(0);
    player.duration = 60;
    duration = getVideoDuration(player.duration, duration);
    expect(duration).toBe(60);
    expect(actions.seek(10, duration)).toBe(30);
  });

  test("uses valid loaded metadata while the native duration is temporarily unavailable", () => {
    const { actions, player } = setup({ duration: 0 });
    expect(getVideoDuration(0, 60)).toBe(60);
    expect(actions.seek(10, 60)).toBe(30);
    expect(player.currentTime).toBe(30);
  });

  test("end resets to zero paused even when Android reports idle", () => {
    const { actions, calls, player } = setup({ currentTime: 60, playing: true, status: "idle" });
    actions.resetAfterEnd();
    expect(player.currentTime).toBe(0);
    expect(player.playing).toBe(false);
    expect(calls).toEqual(["pause"]);
    expect(getVideoControlState("idle", true, false)).toEqual({ disabled: false, isLoading: false, showPause: false });
    expect(actions.toggle(true)).toBe(true);
    expect(calls).toEqual(["pause", "replay"]);
  });

  test("reset buffering keeps the play icon, but initial buffering blocks playback", () => {
    expect(getVideoControlState("loading", true, false)).toEqual({ disabled: false, isLoading: false, showPause: false });
    expect(getVideoControlState("loading", false, false)).toEqual({ disabled: true, isLoading: true, showPause: false });
    expect(getVideoControlState("error", true, false).disabled).toBe(true);
  });
});
