/**
 * Minimaler, frameworkfreier Store. Änderungen laufen ausschließlich über
 * Aktionen; Abonnenten erhalten nach jeder Änderung einen Snapshot.
 */
export function createStore(initialState, reducer, { validateState = () => {} } = {}) {
  if (typeof reducer !== "function") throw new TypeError("Reducer fehlt");
  let state = deepFreeze(structuredClone(initialState));
  validateState(state);
  const listeners = new Set();
  let active = true;
  const assertActive = () => {
    if (!active) throw new Error("Store wurde bereits beendet");
  };

  return Object.freeze({
    getState: () => state,

    dispatch(action) {
      assertActive();
      if (!action || typeof action.type !== "string") throw new TypeError("Ungültige Store-Aktion");
      const safeAction = cloneAction(action);
      const next = reducer(state, safeAction);
      if (next === state) return safeAction;
      if (!next || typeof next !== "object") throw new TypeError("Reducer muss einen Zustand liefern");
      validateState(next);
      state = deepFreeze(next);
      for (const listener of listeners) listener(state, safeAction);
      return safeAction;
    },

    subscribe(listener) {
      assertActive();
      if (typeof listener !== "function") throw new TypeError("Store-Listener muss eine Funktion sein");
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    subscribeSelector(selector, listener, isEqual = Object.is) {
      assertActive();
      if (typeof selector !== "function") throw new TypeError("Store-Selektor muss eine Funktion sein");
      if (typeof listener !== "function") throw new TypeError("Store-Listener muss eine Funktion sein");
      if (typeof isEqual !== "function") throw new TypeError("Vergleichsfunktion fehlt");
      let selected = selector(state);
      const wrapped = (nextState, action) => {
        const nextSelected = selector(nextState);
        if (isEqual(selected, nextSelected)) return;
        const previousSelected = selected;
        selected = nextSelected;
        listener(nextSelected, action, previousSelected);
      };
      listeners.add(wrapped);
      return () => listeners.delete(wrapped);
    },

    destroy() {
      if (!active) return false;
      active = false;
      listeners.clear();
      return true;
    }
  });
}

function cloneAction(action) {
  try {
    return deepFreeze(structuredClone(action));
  } catch (error) {
    throw new TypeError("Store-Aktion muss serialisierbar sein", { cause: error });
  }
}

import { deepFreeze } from "./immutable.js";
