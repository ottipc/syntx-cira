// V3T05 (architecture v2.0.3, 04.2, 05.6.4): FocusScope states for target present / absent / suspended; Escape and
// toggle write through the view's writer; the resolver's output is clipped to ids present in the scope.
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FocusHandle, FocusScope, useFocusState } from "../../src/semiontics";

afterEach(cleanup);
const VM = { links: { a: ["b", "x-not-shown"], b: ["a"], c: [] } as Record<string, string[]> };
const resolve = (f: string, vm: typeof VM) => vm.links[f] ?? [];
function Item({ id }: { id: string }) { const s = useFocusState(id); return <div data-item={id} data-focus-state={s}><FocusHandle id={id}>{id}</FocusHandle></div>; }
const ui = (focus: string | null, onFocus = vi.fn(), suspended = false) => render(
  <FocusScope focus={focus} vm={VM} ids={["a", "b", "c"]} resolveResonance={resolve} onFocus={onFocus} suspended={suspended}>
    <Item id="a" /><Item id="b" /><Item id="c" />
  </FocusScope>);
const st = (c: HTMLElement, id: string) => c.querySelector(`[data-item="${id}"]`)!.getAttribute("data-focus-state");

describe("[V3T05] FocusScope", () => {
  it("target present: exactly one focused, resonant ⊆ resolver ∩ present ids, the rest attenuated; scope active", () => {
    const { container } = ui("a");
    expect(container.querySelector("[data-focus-scope]")!.getAttribute("data-focus-scope")).toBe("active");
    expect([st(container, "a"), st(container, "b"), st(container, "c")]).toEqual(["focused", "resonant", "attenuated"]);
    expect(container.querySelectorAll('[aria-current="true"]')).toHaveLength(1);
  });
  it("no focus: neutral and idle", () => {
    const { container } = ui(null);
    expect(container.querySelector("[data-focus-scope]")!.getAttribute("data-focus-scope")).toBe("idle");
    expect([st(container, "a"), st(container, "b")]).toEqual([null, null]);
  });
  it("target absent: idle, nothing attenuated, the absent chip names the id", () => {
    const { container } = ui("zz");
    expect(container.querySelector("[data-focus-scope]")!.getAttribute("data-focus-scope")).toBe("idle");
    expect(st(container, "a")).toBeNull();
    expect(container.querySelector('[data-term="focus.absent"]')!.textContent).toContain("zz");
  });
  it("quarantine suspends the scope: no attenuation", () => {
    const { container } = ui("a", vi.fn(), true);
    expect(container.querySelector("[data-focus-scope]")!.getAttribute("data-focus-scope")).toBe("idle");
    expect(st(container, "c")).toBeNull();
  });
  it("toggle writes the id, a second click clears; Escape clears", () => {
    const on = vi.fn();
    const { container } = ui("a", on);
    fireEvent.click(container.querySelector('[data-item="b"] button')!);
    expect(on).toHaveBeenLastCalledWith("b");
    fireEvent.click(container.querySelector('[data-item="a"] button')!);
    expect(on).toHaveBeenLastCalledWith(null);
    act(() => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); });
    expect(on).toHaveBeenLastCalledWith(null);
  });
  it("a click on empty workspace clears; a click on an item or a control does not", () => {
    const on = vi.fn();
    const { container } = render(
      <FocusScope focus="a" vm={VM} ids={["a", "b"]} resolveResonance={resolve} onFocus={on}>
        <p data-empty="1">free area</p><div data-focus-id="b"><span data-inside="1">b</span></div><button type="button" data-ctl="1">x</button>
      </FocusScope>);
    fireEvent.click(container.querySelector("[data-inside]")!);
    fireEvent.click(container.querySelector("[data-ctl]")!);
    expect(on).not.toHaveBeenCalled();
    fireEvent.click(container.querySelector("[data-empty]")!);
    expect(on).toHaveBeenLastCalledWith(null);
  });
  it("Escape inside an open modal dialog belongs to the dialog and keeps the focus", () => {
    const on = vi.fn();
    ui("a", on);
    const d = document.createElement("div"); d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); document.body.append(d);
    act(() => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); });
    d.remove();
    expect(on).not.toHaveBeenCalled();
  });
});
