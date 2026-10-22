import { serviceDates } from "./schedule.mjs";
import { createCalendarPdf } from "./pdf.mjs";

const status = document.getElementById("status");
const calendarEl = document.getElementById("calendar");
const calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: "dayGridMonth",
  locale: "es",
  height: "auto",
  dateClick(info) {
    const note = prompt("Ingresá una anotación:");
    if (!note?.trim()) return;
    const existing = calendar.getEvents().find(event => event.startStr === info.dateStr && event.title === "Nota");
    if (existing) {
      existing.setExtendedProp("description", `${existing.extendedProps.description || ""}\n${note.trim()}`.trim());
    } else {
      calendar.addEvent({ title: "Nota", start: info.dateStr, allDay: true, description: note.trim() });
    }
  },
  eventContent({ event }) {
    const content = document.createElement("div");
    content.className = "event-content";
    if (event.title !== "Nota") {
      const title = document.createElement("div");
      title.className = "event-title";
      title.textContent = event.title;
      content.appendChild(title);
    }
    for (const note of (event.extendedProps.description || "").split("\n").filter(Boolean)) {
      const element = document.createElement("div");
      element.className = "event-note";
      element.textContent = note;
      content.appendChild(element);
    }
    return { domNodes: [content] };
  }
});
calendar.render();

document.getElementById("calcular").addEventListener("click", () => {
  try {
    const date = document.getElementById("fecha").value;
    const dates = serviceDates(document.getElementById("horario").value, date);
    calendar.removeAllEvents();
    calendar.addEventSource(dates.map(start => ({ title: "Servicio", start, allDay: true })));
    calendar.gotoDate(date);
    status.textContent = `${dates.length} ${dates.length === 1 ? "jornada" : "jornadas"} de servicio hasta el 31 de diciembre. Al recalcular se reemplazan las fechas y anotaciones anteriores.`;
  } catch (error) {
    status.textContent = error.message;
  }
});

document.getElementById("generatePDF").addEventListener("click", async event => {
  const button = event.currentTarget;
  button.disabled = true;
  status.textContent = "Preparando el PDF…";
  try {
    const canvas = await html2canvas(calendarEl, { scale: 1, backgroundColor: "#ffffff" });
    const doc = createCalendarPdf(canvas, window.jspdf.jsPDF);
    doc.save("Servicios_mes.pdf");
    status.textContent = "El PDF está listo para guardar.";
  } catch {
    status.textContent = "No pudimos preparar el PDF. Probá nuevamente.";
  } finally {
    button.disabled = false;
  }
});
