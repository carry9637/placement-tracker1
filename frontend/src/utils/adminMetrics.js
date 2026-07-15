export const getUniqueStudentsFromApplications = (applications = []) => {
  const map = new Map();

  applications.forEach((application) => {
    const student = application.student;
    if (!student?._id) return;

    const existing = map.get(student._id);
    const studentApplications = [...(existing?.applicationRecords || []), application].sort(
      (a, b) => new Date(b.updatedAt || b.appliedAt || 0) - new Date(a.updatedAt || a.appliedAt || 0)
    );

    map.set(student._id, {
      ...student,
      applications: (existing?.applications || 0) + 1,
      applicationRecords: studentApplications,
      latestApplication: studentApplications[0],
      lastActivityAt: studentApplications[0]?.updatedAt || studentApplications[0]?.appliedAt,
    });
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.lastActivityAt || 0) - new Date(a.lastActivityAt || 0));
};

export const compactDate = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
};

export const moneyRange = (salary = {}) => {
  if (!salary.isDisclosed) return "Undisclosed";
  const min = salary.min ? Number(salary.min).toLocaleString("en-IN") : null;
  const max = salary.max ? Number(salary.max).toLocaleString("en-IN") : null;
  if (min && max) return (salary.currency || "INR") + " " + min + " - " + max;
  if (min) return (salary.currency || "INR") + " " + min + "+";
  return "Disclosed";
};

export const getPackageStats = (jobs = []) => {
  const disclosed = jobs
    .map((job) => job.salary)
    .filter((salary) => salary?.isDisclosed)
    .map((salary) => Number(salary.max || salary.min || 0))
    .filter((value) => value > 0);

  if (!disclosed.length) {
    return { highest: "Undisclosed", average: "Undisclosed" };
  }

  const format = (value) => `INR ${Math.round(value).toLocaleString("en-IN")}`;
  const highest = Math.max(...disclosed);
  const average = disclosed.reduce((sum, value) => sum + value, 0) / disclosed.length;

  return {
    highest: format(highest),
    average: format(average),
  };
};
