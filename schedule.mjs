const shifts = Object.freeze({ "12x36": [2, 1], "24x48": [3, 1], "48x96": [6, 2] });

export function serviceDates(shift, initialDate) {
  const pattern = shifts[shift];
  if (!pattern || !/^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
    throw new Error("Seleccioná un horario y una fecha válidos.");
  }
  const start = new Date(`${initialDate}T00:00:00.000Z`);
  if (!Number.isFinite(start.getTime()) || start.toISOString().slice(0, 10) !== initialDate) {
    throw new Error("Seleccioná una fecha válida.");
  }
  const [cycleDays, workingDays] = pattern;
  const year = start.getUTCFullYear();
  const lastDay = Date.UTC(year, 11, 31);
  const dates = [];
  for (let cycle = start.getTime(); cycle <= lastDay; cycle += cycleDays * 86400000) {
    for (let day = 0; day < workingDays; day++) {
      const workday = cycle + day * 86400000;
      if (workday <= lastDay) dates.push(new Date(workday).toISOString().slice(0, 10));
    }
  }
  return dates;
}
