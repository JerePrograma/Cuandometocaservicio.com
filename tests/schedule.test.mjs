import test from "node:test";
import assert from "node:assert/strict";
import { serviceDates } from "../schedule.mjs";

test("12x36 y 24x48 conservan el día elegido y los intervalos hasta fin de año", () => {
  assert.deepEqual(serviceDates("12x36", "2026-12-27"), ["2026-12-27", "2026-12-29", "2026-12-31"]);
  assert.deepEqual(serviceDates("24x48", "2026-12-25"), ["2026-12-25", "2026-12-28", "2026-12-31"]);
});

test("48x96 produce dos jornadas por ciclo y no agrega enero al iniciar el 31 de diciembre", () => {
  assert.deepEqual(serviceDates("48x96", "2026-12-24"), ["2026-12-24", "2026-12-25", "2026-12-30", "2026-12-31"]);
  assert.deepEqual(serviceDates("48x96", "2026-12-31"), ["2026-12-31"]);
});

test("el calendario conserva el 29 de febrero en un año bisiesto", () => {
  assert.deepEqual(serviceDates("12x36", "2028-02-27").slice(0, 3), ["2028-02-27", "2028-02-29", "2028-03-02"]);
});

test("rechaza fechas imposibles y horarios desconocidos", () => {
  for (const value of ["", "2026-02-30", "2026-13-01", "2026-12-32", "2026-1-1"]) {
    assert.throws(() => serviceDates("12x36", value));
  }
  assert.throws(() => serviceDates("otro", "2026-12-31"));
});
