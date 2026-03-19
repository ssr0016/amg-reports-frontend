// /src/utils/exportExcel.js
// Requires: npm install exceljs file-saver
// Remove: npm uninstall xlsx

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// ─── STYLES ──────────────────────────────────────────────────────────────────

const F = {
  title: { name: "Arial", bold: true, size: 14 },
  subtitle: { name: "Arial", bold: true, size: 10 },
  headerWh: {
    name: "Arial",
    bold: true,
    size: 10,
    color: { argb: "FFFFFFFF" },
  },
  bold: { name: "Arial", bold: true, size: 10 },
  normal: { name: "Arial", bold: false, size: 10 },
  small: { name: "Arial", bold: false, size: 8 },
};

const FILL_BLACK = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF000000" },
};
const BORDER_THIN = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};
const BORDER_BTM = { bottom: { style: "thin" } };
const AL_CTR = { horizontal: "center", vertical: "middle" };
const AL_LEFT = { horizontal: "left", vertical: "middle" };
const AL_TOP_LEFT = { horizontal: "left", vertical: "top", wrapText: true };

function borderRow(ws, rowNum, c1, c2) {
  for (let c = c1; c <= c2; c++)
    ws.getRow(rowNum).getCell(c).border = BORDER_THIN;
}

// ─── ACTIVITY ROW HELPER ─────────────────────────────────────────────────────

function actRow(ws, rowNum, label, weekData, font, indent = false) {
  const w = weekData || {};
  const row = ws.getRow(rowNum);
  row.height = 16;

  const lc = row.getCell(1);
  lc.value = indent ? `   ${label}` : label;
  lc.font = font;
  lc.alignment = AL_LEFT;
  lc.border = BORDER_THIN;

  [w.week1, w.week2, w.week3, w.week4, w.week5].forEach((val, i) => {
    const cell = row.getCell(i + 2);
    cell.value = val ?? "";
    cell.font = F.normal;
    cell.alignment = AL_CTR;
    cell.border = BORDER_THIN;
  });

  const avg = row.getCell(7);
  avg.value = { formula: `IFERROR(AVERAGE(B${rowNum}:F${rowNum}),"")` };
  avg.font = F.normal;
  avg.alignment = AL_CTR;
  avg.border = BORDER_THIN;
}

// ─── BUILD ONE WORKSHEET ─────────────────────────────────────────────────────

function buildSheet(ws, report) {
  ws.columns = [
    { width: 28 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
  ];

  // Row 1 — Title
  ws.mergeCells("A1:G1");
  ws.getRow(1).height = 22;
  const r1c1 = ws.getRow(1).getCell(1);
  r1c1.value = "ANG MANANAMPALATAYANG GUMAWA";
  r1c1.font = F.title;
  r1c1.alignment = AL_CTR;

  // Row 2 — Subtitle
  ws.mergeCells("A2:G2");
  ws.getRow(2).height = 16;
  const r2c1 = ws.getRow(2).getCell(1);
  r2c1.value = "NATIONAL WORKER'S MONTHLY MINISTRY REPORT";
  r2c1.font = F.subtitle;
  r2c1.alignment = AL_CTR;

  // Row 3 — blank spacer
  ws.getRow(3).height = 6;

  // Rows 4–7 — Info fields
  [
    [4, "Month of:", `${report.month || ""} ${report.year || ""}`], // ✅ added year
    [5, "Worker", report.worker || ""],
    [6, "Area of Assignment", report.areaAssignment || ""],
    [7, "Name of Church/Outreach:", report.churchName || ""],
  ].forEach(([rowNum, label, value]) => {
    ws.mergeCells(`B${rowNum}:G${rowNum}`);
    ws.getRow(rowNum).height = 16;
    const lc = ws.getRow(rowNum).getCell(1);
    lc.value = label;
    lc.font = F.normal;
    lc.alignment = AL_LEFT;
    const vc = ws.getRow(rowNum).getCell(2);
    vc.value = value;
    vc.font = F.normal;
    vc.border = BORDER_BTM;
  });

  // Row 8 — "Weekly Attendance" black header
  ws.mergeCells("A8:G8");
  ws.getRow(8).height = 16;
  const r8c1 = ws.getRow(8).getCell(1);
  r8c1.value = "Weekly Attendance";
  r8c1.font = F.headerWh;
  r8c1.fill = FILL_BLACK;
  r8c1.alignment = AL_LEFT;

  // Row 9 — Column headers
  ws.getRow(9).height = 16;
  [
    "Activities",
    "Week 1",
    "Week 2",
    "Week 3",
    "Week 4",
    "Week 5",
    "Average",
  ].forEach((h, i) => {
    const cell = ws.getRow(9).getCell(i + 1);
    cell.value = h;
    cell.font = F.bold;
    cell.alignment = i === 0 ? AL_LEFT : AL_CTR;
    cell.border = BORDER_THIN;
  });

  // Rows 10–18 — Attendance
  [
    ["Worship Service", report.worshipService],
    ["Sunday School", report.sundaySchool],
    ["Prayer Meeting", report.prayerMeeting],
    ["Bible Studies", report.bibleStudies],
    ["Mens Fellowships", report.mensFellowship],
    ["Womens Fellowships", report.womensFellowship],
    ["Youth Fellowships", report.youthFellowship],
    ["Children Fellowships", report.childrenFellowship],
    ["Outreach", report.outreach],
  ].forEach(([label, data], i) => actRow(ws, 10 + i, label, data, F.normal));

  // Row 19 — blank
  borderRow(ws, 19, 1, 7);

  // Rows 20–22 — Training / Seminars
  actRow(ws, 20, "Training/ Seminars", report.training || {}, F.bold);
  actRow(ws, 21, "Leadership Conference", {}, F.small, true);
  actRow(ws, 22, "Leadership Training", report.leadership || {}, F.small, true);

  // Row 23 — blank
  borderRow(ws, 23, 1, 7);

  // Rows 24–25 — Other / Family Day
  actRow(ws, 24, "Other", report.other || {}, F.bold);
  actRow(ws, 25, "Family Day", report.familyDay || {}, F.small, true);

  // Row 26 — blank
  borderRow(ws, 26, 1, 7);

  // Row 27 — Tithes & Offering
  actRow(ws, 27, "Tithes & Offering", report.tithesOffering || {}, F.normal);

  // Row 28 — blank
  borderRow(ws, 28, 1, 7);

  // Row 29 — black divider
  ws.mergeCells("A29:G29");
  ws.getRow(29).height = 12;
  for (let c = 1; c <= 7; c++) ws.getRow(29).getCell(c).fill = FILL_BLACK;

  // Row 30 — 2nd column headers
  ws.getRow(30).height = 16;
  ["", "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Average"].forEach(
    (h, i) => {
      const cell = ws.getRow(30).getCell(i + 1);
      cell.value = h;
      cell.font = F.bold;
      cell.alignment = i === 0 ? AL_LEFT : AL_CTR;
      cell.border = BORDER_THIN;
    },
  );

  // Rows 31–36 — Ministry activities
  [
    ["Home Visited", report.homeVisited],
    ["Bible Study Group Led", report.bibleStudyGroupLed],
    ["Sermon/Message Preached", report.sermonPreached],
    ["Person Newly Contacted", report.personNewlyContacted],
    ["Person Followed-up", report.personFollowedUp],
    ["Person Led To Christ", report.personEvangelized],
  ].forEach(([label, data], i) => actRow(ws, 31 + i, label, data, F.normal));

  // Row 37 — Names
  ws.mergeCells("B37:G37");
  ws.getRow(37).height = 16;
  ws.getRow(37).getCell(1).value = "Names:";
  ws.getRow(37).getCell(1).font = F.bold;
  ws.getRow(37).getCell(1).alignment = AL_LEFT;
  ws.getRow(37).getCell(2).value = report.names || "";
  ws.getRow(37).getCell(2).font = F.normal;
  borderRow(ws, 37, 1, 7);

  [38, 39].forEach((r) => {
    ws.mergeCells(`B${r}:G${r}`);
    borderRow(ws, r, 1, 7);
  });

  // Row 40 — Narrative Report
  ws.mergeCells("B40:G40");
  ws.getRow(40).height = 50;
  ws.getRow(40).getCell(1).value = "Narrative Report:";
  ws.getRow(40).getCell(1).font = F.bold;
  ws.getRow(40).getCell(1).alignment = AL_TOP_LEFT;
  ws.getRow(40).getCell(2).value = report.narrativeReport || "";
  ws.getRow(40).getCell(2).alignment = AL_TOP_LEFT;
  borderRow(ws, 40, 1, 7);

  // Row 41 — blank
  ws.mergeCells("B41:G41");
  borderRow(ws, 41, 1, 7);

  // Row 42 — Challenges
  ws.mergeCells("B42:G42");
  ws.getRow(42).height = 35;
  ws.getRow(42).getCell(1).value = "Challenges/Problem\nEncountered";
  ws.getRow(42).getCell(1).font = F.normal;
  ws.getRow(42).getCell(1).alignment = AL_TOP_LEFT;
  ws.getRow(42).getCell(2).value = report.challenges || "";
  ws.getRow(42).getCell(2).alignment = AL_TOP_LEFT;
  borderRow(ws, 42, 1, 7);

  // Row 43 — Prayer Request
  ws.mergeCells("B43:G43");
  ws.getRow(43).height = 20;
  ws.getRow(43).getCell(1).value = "Prayer Request";
  ws.getRow(43).getCell(1).font = F.normal;
  ws.getRow(43).getCell(1).alignment = AL_LEFT;
  ws.getRow(43).getCell(2).value = report.prayerRequest || "";
  borderRow(ws, 43, 1, 7);
}

// ─── EXPORT SINGLE ────────────────────────────────────────────────────────────

export async function exportSingleReport(report) {
  const wb = new ExcelJS.Workbook();
  buildSheet(wb.addWorksheet("Report"), report);

  const fileName =
    `${report.worker || "Report"}_${report.month || "Unknown"}_${report.year || ""}.xlsx`.replace(
      /\s+/g,
      "_",
    ); // ✅ added year sa filename

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
}

// ─── EXPORT BULK ──────────────────────────────────────────────────────────────

export async function exportBulkReports(reports, month) {
  const wb = new ExcelJS.Workbook();

  // ── REPORT DASHBOARD SHEET ──────────────────────────────────────────────────
  const dash = wb.addWorksheet("Report Dashboard");
  dash.columns = [
    { width: 38 }, // A - Churches
    { width: 14 }, // B - Month
    { width: 10 }, // C - Year  ✅ new column
    { width: 14 }, // D - Status
    { width: 22 }, // E - Coordinator Remark
    { width: 18 }, // F - Support Status
  ];

  // Title row — ✅ extended to F1
  dash.mergeCells("A1:F1");
  const titleCell = dash.getRow(1).getCell(1);
  titleCell.value = "Report Dashboard";
  titleCell.font = {
    name: "Arial",
    bold: true,
    size: 18,
    color: { argb: "FF0000FF" },
  };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFDDDDFF" },
  };
  dash.getRow(1).height = 30;

  // Header row — ✅ added Month and Year columns
  const headers = [
    "Churches",
    "Month",
    "Year",
    "Status",
    "Coordinator's Remark",
    "Support Status",
  ];
  const headerRow = dash.getRow(2);
  headerRow.height = 18;
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: "Arial", bold: true, size: 10 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = BORDER_THIN;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };
  });

  // Data rows
  reports.forEach((r, i) => {
    const row = dash.getRow(i + 3);
    row.height = 16;

    // A — Church name
    const churchCell = row.getCell(1);
    churchCell.value = r.churchName || r.worker || "";
    churchCell.font = { name: "Arial", size: 10 };
    churchCell.alignment = { horizontal: "left", vertical: "middle" };
    churchCell.border = BORDER_THIN;

    // B — Month ✅
    const monthCell = row.getCell(2);
    monthCell.value = r.month || "";
    monthCell.font = { name: "Arial", size: 10 };
    monthCell.alignment = { horizontal: "center", vertical: "middle" };
    monthCell.border = BORDER_THIN;

    // C — Year ✅
    const yearCell = row.getCell(3);
    yearCell.value = r.year || "";
    yearCell.font = { name: "Arial", bold: true, size: 10 };
    yearCell.alignment = { horizontal: "center", vertical: "middle" };
    yearCell.border = BORDER_THIN;

    // D — Status with color
    const approved = r.completed === true;
    const statusCell = row.getCell(4);
    statusCell.value = approved ? "Approved" : "For Review";
    statusCell.font = {
      name: "Arial",
      bold: true,
      size: 10,
      color: { argb: "FFFFFFFF" },
    };
    statusCell.alignment = { horizontal: "center", vertical: "middle" };
    statusCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: approved ? "FF00AA00" : "FFCC0000" },
    };
    statusCell.border = BORDER_THIN;

    // E — Coordinator Remark
    const remarkCell = row.getCell(5);
    remarkCell.value = "Checked";
    remarkCell.font = {
      name: "Arial",
      bold: true,
      size: 10,
      color: { argb: "FFFFFFFF" },
    };
    remarkCell.alignment = { horizontal: "center", vertical: "middle" };
    remarkCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0000CC" },
    };
    remarkCell.border = BORDER_THIN;

    // F — Support Status
    const supportCell = row.getCell(6);
    supportCell.value = approved ? "Ready for Pick Up" : "On Hold";
    supportCell.font = {
      name: "Arial",
      bold: true,
      size: 10,
      color: { argb: approved ? "FFFFFFFF" : "FF000000" },
    };
    supportCell.alignment = { horizontal: "center", vertical: "middle" };
    supportCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: approved ? "FF0000CC" : "FFFFFF00" },
    };
    supportCell.border = BORDER_THIN;
  });

  // One sheet per church
  const usedNames = new Set();
  reports.forEach((report) => {
    let base = (report.churchName || report.worker || "Unknown").substring(
      0,
      31,
    );
    let name = base;
    let n = 1;
    while (usedNames.has(name)) {
      const sfx = `_${n++}`;
      name = base.substring(0, 31 - sfx.length) + sfx;
    }
    usedNames.add(name);
    buildSheet(wb.addWorksheet(name), report);
  });

  // ✅ added year sa bulk filename din
  const fileName =
    `Reports_${month || "All"}_${new Date().getFullYear()}.xlsx`.replace(
      /\s+/g,
      "_",
    );
  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
}
