// A report week runs weekStartDate -> weekStartDate + 6 days (7 days total).
// The deadline is the start of the day AFTER the week ends - so a member
// can submit any time on the week's last day and still be on time, but
// the moment the next day begins, it's late. No extra grace period -
// this is the plain, unambiguous "due by end of week" rule.
function weekDeadline(weekStartDate) {
  const deadline = new Date(weekStartDate);
  deadline.setDate(deadline.getDate() + 7);
  return deadline;
}

function isPastDeadline(weekStartDate, now = new Date()) {
  return now.getTime() >= weekDeadline(weekStartDate).getTime();
}

module.exports = { weekDeadline, isPastDeadline };
