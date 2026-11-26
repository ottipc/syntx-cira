// Hands-free demo playback (G05.3 extension for recording, ADR-0006 Nr. 5): pure navigation, SECONDS_PER_STEP per step,
// ends after the last step; manual navigation, Escape or Stop ends it. REQ-076.
import { act, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SECONDS_PER_STEP } from "../../src/demo";
import { renderAt, settle } from "../helpers/render";
import { EXP } from "../helpers/snapshots";

const stepOf = () => new URL(window.location.href).searchParams.get("demoStep");
afterEach(() => vi.useRealTimers());

describe("[TX31][REQ-076] hands-free demo playback", () => {
  it("[TX31] Play walks steps 1 → 8 at the configured pace (8 × 10 s = 80 s), then stops; never POSTs", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const r = await renderAt(`/exp/${EXP.baseline}/SYSTEM_FIELD_OVERVIEW?tick=0`);
    expect(SECONDS_PER_STEP * 8).toBe(80);
    await act(async () => { fireEvent.click(r.root.querySelector('[data-term="action.play_demo"]')!); });
    await settle(r.root, r.client);
    expect(stepOf()).toBe("1");
    expect(new URL(window.location.href).searchParams.get("mode")).toBe("presentation");
    for (let n = 2; n <= 8; n += 1) {
      await act(async () => { await vi.advanceTimersByTimeAsync(SECONDS_PER_STEP * 1000 - 1000); });
      expect(stepOf(), `not yet at ${n}`).toBe(String(n - 1));
      await act(async () => { await vi.advanceTimersByTimeAsync(1100); });
      await settle(r.root, r.client);
      expect(stepOf()).toBe(String(n));
    }
    expect(r.root.querySelector('[data-playing="true"]')).not.toBeNull();
    await act(async () => { await vi.advanceTimersByTimeAsync(SECONDS_PER_STEP * 1000 + 10); });
    expect(stepOf(), "stays on the last step").toBe("8");
    expect(r.root.querySelector('[data-playing="false"]'), "playback ended").not.toBeNull();
    expect(r.server.posts).toEqual([]);
    expect(r.server.misses).toEqual([]);
  });

  it("[TX31] Escape, Stop and manual navigation end the playback", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const r = await renderAt(`/exp/${EXP.baseline}/SYSTEM_FIELD_OVERVIEW?tick=0`);
    const play = async () => { await act(async () => { fireEvent.click(r.root.querySelector('[data-term="action.play_demo"]')!); }); await settle(r.root, r.client); };
    const frozen = async () => {
      const at = stepOf();
      await act(async () => { await vi.advanceTimersByTimeAsync(SECONDS_PER_STEP * 2000); });
      expect(stepOf()).toBe(at);
    };
    await play();
    await act(async () => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); });
    await frozen();
    await play();
    await act(async () => { fireEvent.click(r.root.querySelector('[data-term="action.stop_demo"]')!); });
    await frozen();
    await play();
    await act(async () => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown" })); });
    await settle(r.root, r.client);
    expect(stepOf()).toBe("2");
    await frozen();
  });
});
