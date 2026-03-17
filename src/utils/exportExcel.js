// /src/utils/exportExcel.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function reportToRows(report) {
  const sections = [
    { label: "Worship Service", key: "worshipService" },
    { label: "Sunday School", key: "sundaySchool" },
    { label: "Prayer Meeting", key: "prayerMeeting" },
    { label: "Bible Studies", key: "bibleStudies" },
    { label: "Men's Fellowship", key: "mensFellowship" },
    { label: "Women's Fellowship", key: "womensFellowship" },
    { label: "Youth Fellowship", key: "youthFellowship" },
    { label: "Children Fellowship", key: "childrenFellowship" },
    { label: "Tithes & Offering (₱)", key: "tithesOffering" },
    { label: "Homes Visited", key: "homeVisited" },
    { label: "Bible Study Group Led", key: "bibleStudyGroupLed" },
    { label: "Sermon Preached", key: "sermonPreached" },
    { label: "Person Newly Contacted", key: "personNewlyContacted" },
    { label: "Person Followed Up", key: "personFollowedUp" },
    { label: "Person Evangelized", key: "personEvangelized" },
    { label: "Outreach", key: "outreach" },
    { label: "Training", key: "training" },
    { label: "Leadership", key: "leadership" },
    { label: "Baptism", key: "baptism" },
    { label: "Other", key: "other" },
    { label: "Family Day", key: "familyDay" },
  ];

  const rows = [];

  // Header info
  rows.push(["Month", report.month || ""]);
  rows.push(["Worker", report.worker || ""]);
  rows.push(["Area Assignment", report.areaAssignment || ""]);
  rows.push(["Church Name", report.churchName || ""]);
  rows.push(["Status", report.completed ? "Approved" : "For Review"]);
  rows.push([]); // blank row

  // ✅ Weekly section header — walang "CATEGORY" label
  rows.push(["", "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "TOTAL"]);

  // Weekly data rows
  sections.forEach(({ label, key }) => {
    const w = report[key] || {};
    const total = [w.week1, w.week2, w.week3, w.week4, w.week5]
      .filter((v) => v !== null && v !== undefined && v !== "")
      .reduce((a, b) => a + Number(b), 0);
    rows.push([
      label,
      w.week1 ?? "",
      w.week2 ?? "",
      w.week3 ?? "",
      w.week4 ?? "",
      w.week5 ?? "",
      total,
    ]);
  });

  rows.push([]); // blank row

  // Text fields
  rows.push(["Names of New Believers / Baptized", report.names || ""]);
  rows.push(["Narrative Report", report.narrativeReport || ""]);
  rows.push(["Challenges", report.challenges || ""]);
  rows.push(["Prayer Requests", report.prayerRequest || ""]);

  return rows;
}

// ✅ EXPORT SINGLE REPORT
export function exportSingleReport(report) {
  const rows = reportToRows(report);

  // ✅ aoa = array of arrays — walang auto-generated headers
  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws["!cols"] = [
    { wch: 35 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  const fileName =
    `${report.worker || "Report"}_${report.month || "Unknown"}.xlsx`.replace(
      /\s+/g,
      "_",
    );

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, fileName);
}

// ✅ EXPORT BULK — lahat ng reports ng specific month
export function exportBulkReports(reports, month) {
  const wb = XLSX.utils.book_new();

  // ✅ Summary sheet
  const summaryRows = [
    ["WORKER", "CHURCH NAME", "AREA ASSIGNMENT", "MONTH", "STATUS"],
    ...reports.map((r) => [
      r.worker || "",
      r.churchName || "",
      r.areaAssignment || "",
      r.month || "",
      r.completed ? "Approved" : "For Review",
    ]),
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
  summaryWs["!cols"] = [
    { wch: 25 },
    { wch: 35 },
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // ✅ Individual sheet per worker
  reports.forEach((report) => {
    const rows = reportToRows(report);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [
      { wch: 35 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ];

    const sheetName = (report.worker || "Unknown").substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const fileName = `Reports_${month || "All"}.xlsx`.replace(/\s+/g, "_");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, fileName);
}
