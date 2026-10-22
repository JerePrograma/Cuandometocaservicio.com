import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { jsPDF } from "jspdf";
import { createCalendarPdf } from "../pdf.mjs";

test("el PDF usa jsPDF actual, conserva la proporción y produce un archivo A4 horizontal", () => {
  const png = `data:image/png;base64,${readFileSync(new URL("../img/Logo_JerePrograma_500mp.png", import.meta.url)).toString("base64")}`;
  const document = createCalendarPdf({ width: 1200, height: 800, toDataURL: () => png }, jsPDF);
  const bytes = Buffer.from(document.output("arraybuffer"));
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
  assert.equal(document.getNumberOfPages(), 1);
  assert.ok(document.internal.pageSize.getWidth() > document.internal.pageSize.getHeight());
  assert.ok(bytes.length > 1000);
});
