// Snap any picked date to the Monday of that calendar week - this is what
// makes "the same week" mean the same thing for every team member. Without
// this, two people could both mean "this week" but store different exact
// dates, and nothing would ever group or compare correctly.
export function mondayOf(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

export function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// Accepts a plain "YYYY-MM-DD" string, a full ISO datetime string, or a
// Date object - all represent the same UTC-midnight instant since dates
// only ever come from date-only inputs. Adds 7 days in UTC to avoid any
// local-timezone drift across the addition.
export function weekDeadline(weekStartDate) {
  const d = new Date(weekStartDate);
  const deadline = new Date(d.getTime());
  deadline.setUTCDate(deadline.getUTCDate() + 7);
  return deadline;
}

export function isPastDeadline(weekStartDate, now = new Date()) {
  return now.getTime() >= weekDeadline(weekStartDate).getTime();
}

// What should actually render in the UI for a report's status: submitted/
// late are shown as-is, but an un-submitted draft whose deadline has
// passed should read as Late too, everywhere - not just in the summary
// panel - otherwise a draft sits forever looking harmlessly "in progress."
export function displayStatus(report) {
  if (report.status === 'submitted' || report.status === 'late') return report.status;
  return isPastDeadline(report.weekStartDate) ? 'late' : 'draft';
}
