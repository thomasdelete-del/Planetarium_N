import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/app/state.js";
import { createStore } from "../src/app/store.js";
import { appReducer } from "../src/app/reducer.js";

test("Store aktualisiert nur den adressierten Zustandsbereich", () => {
  const initial = createInitialState(new Date("2026-08-09T12:00:00Z"));
  const store = createStore(initial, appReducer);
  store.dispatch({ type: "observer/changed", payload: { latitude: 52.52, name: "Berlin" } });

  assert.equal(store.getState().observer.latitude, 52.52);
  assert.equal(store.getState().observer.name, "Berlin");
  assert.equal(store.getState().observer.longitude, initial.observer.longitude);
  assert.deepEqual(store.getState().view, initial.view);
});

test("Unbekannte Aktionen verändern den Zustand nicht", () => {
  const initial = createInitialState();
  assert.equal(appReducer(initial, { type: "unknown" }), initial);
});

test("Store-Zustände sind unveränderliche Snapshots", () => {
  const store = createStore(createInitialState(), appReducer);
  const snapshot = store.getState();
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.observer), true);
  assert.throws(() => { snapshot.observer.latitude = 0; }, TypeError);
});

test("Hydrierung kopiert Nutzdaten und erhält nicht gelieferte Teilzustände", () => {
  const store = createStore(createInitialState(), appReducer);
  const payload = { observer: { latitude: 50 } };
  const previousLayers = store.getState().layers;
  store.dispatch({ type: "state/hydrated", payload });

  payload.observer.latitude = 10;
  assert.equal(store.getState().observer.latitude, 50);
  assert.equal(store.getState().layers, previousLayers);
  assert.equal(Object.isFrozen(payload.observer), false);
});

test("Store weist ungültige Aktionen und Listener zurück", () => {
  const store = createStore(createInitialState(), appReducer);
  assert.throws(() => store.dispatch({}), /Store-Aktion/);
  assert.throws(() => store.subscribe(null), /Store-Listener/);
});

test("Fehlgeschlagene Zustandsvalidierung lässt den alten Snapshot bestehen", () => {
  const initial = { value: 1 };
  const store = createStore(initial, (_state, action) => ({ value: action.payload }), {
    validateState: (state) => {
      if (state.value < 0) throw new RangeError("Wert darf nicht negativ sein");
    }
  });
  const previous = store.getState();
  assert.throws(() => store.dispatch({ type: "value/set", payload: -1 }), /nicht negativ/);
  assert.equal(store.getState(), previous);
});

test("Reducer und Listener erhalten einen unveränderlichen Aktionssnapshot", () => {
  const original = { type: "value/set", payload: { value: 2 } };
  let reducerAction;
  let listenerAction;
  const store = createStore({ value: 1 }, (_state, action) => {
    reducerAction = action;
    return { value: action.payload.value };
  });
  store.subscribe((_state, action) => { listenerAction = action; });
  const returned = store.dispatch(original);

  original.payload.value = 99;
  assert.equal(reducerAction, listenerAction);
  assert.equal(returned, reducerAction);
  assert.equal(Object.isFrozen(returned.payload), true);
  assert.equal(store.getState().value, 2);
});

test("Nicht serialisierbare Aktionen werden kontrolliert abgewiesen", () => {
  const store = createStore({ value: 1 }, (state) => state);
  assert.throws(
    () => store.dispatch({ type: "invalid", payload: () => {} }),
    /serialisierbar/
  );
});

test("Selektives Abonnement reagiert nur auf geänderte Auswahlwerte", () => {
  const store = createStore({ observer: { name: "München" }, count: 0 }, (state, action) => {
    if (action.type === "count") return { ...state, count: action.payload };
    if (action.type === "name") return { ...state, observer: { name: action.payload } };
    return state;
  });
  const changes = [];
  const unsubscribe = store.subscribeSelector(
    (state) => state.observer.name,
    (next, action, previous) => changes.push({ next, type: action.type, previous })
  );

  store.dispatch({ type: "count", payload: 1 });
  store.dispatch({ type: "name", payload: "Berlin" });
  store.dispatch({ type: "name", payload: "Berlin" });
  unsubscribe();
  store.dispatch({ type: "name", payload: "Hamburg" });

  assert.deepEqual(changes, [{ next: "Berlin", type: "name", previous: "München" }]);
});

test("Selektives Abonnement validiert Selektor, Listener und Vergleich", () => {
  const store = createStore({ value: 1 }, (state) => state);
  assert.throws(() => store.subscribeSelector(null, () => {}), /Store-Selektor/);
  assert.throws(() => store.subscribeSelector((state) => state, null), /Store-Listener/);
  assert.throws(() => store.subscribeSelector((state) => state, () => {}, null), /Vergleichsfunktion/);
});

test("Store-Abschluss entfernt Subscriber und verhindert weitere Schreibzugriffe", () => {
  const store = createStore({ value: 1 }, (state, action) => ({ value: action.payload }));
  let notifications = 0;
  store.subscribe(() => { notifications += 1; });

  assert.equal(store.destroy(), true);
  assert.equal(store.destroy(), false);
  assert.equal(store.getState().value, 1);
  assert.throws(() => store.dispatch({ type: "value", payload: 2 }), /beendet/);
  assert.throws(() => store.subscribe(() => {}), /beendet/);
  assert.equal(notifications, 0);
});
