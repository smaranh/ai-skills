// Data-driven resume generator.
// Usage: NODE_PATH=<global modules> node build_resume.js <content.json> <out.docx>
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, LevelFormat,
  ExternalHyperlink, BorderStyle, TabStopType, TabStopPosition,
} = require("docx");

const contentPath = process.argv[2] || "resume-content.json";
const outPath = process.argv[3] || "Resume.docx";
const C = JSON.parse(fs.readFileSync(contentPath, "utf8"));

const ACCENT = "1F3A5F";
const RULE = { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 };
const contactSep = () => new TextRun({ text: "  |  ", color: "666666" });

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 120, after: 50 },
    keepNext: true,
    border: { bottom: RULE },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: ACCENT, allCaps: true })],
  });
}

function jobHeader(company, title, dates) {
  return new Paragraph({
    spacing: { before: 80, after: 20 },
    keepNext: true,
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [
      new TextRun({ text: company, bold: true, size: 21 }),
      new TextRun({ text: "  —  ", size: 21, color: "666666" }),
      new TextRun({ text: title, size: 21, italics: true }),
      new TextRun({ text: "\t" + dates, size: 19, color: "555555" }),
    ],
  });
}

// A bullet "spec" is an array of run objects: { t: "normal" } or { b: "bold" }.
function runsFromSpec(spec) {
  return spec.map((s) =>
    s.b !== undefined
      ? new TextRun({ text: s.b, size: 20, bold: true })
      : new TextRun({ text: s.t, size: 20 })
  );
}

function bullet(spec) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 20 },
    children: runsFromSpec(spec),
  });
}

function skillLine(label, value) {
  return new Paragraph({
    spacing: { after: 24 },
    children: [
      new TextRun({ text: label + ":  ", bold: true, size: 20, color: ACCENT }),
      new TextRun({ text: value, size: 20 }),
    ],
  });
}

const children = [];

// HEADER
children.push(new Paragraph({
  spacing: { after: 20 },
  children: [new TextRun({ text: C.name, bold: true, size: 40, color: "1A1A1A" })],
}));
children.push(new Paragraph({
  spacing: { after: 40 },
  children: [new TextRun({ text: C.tagline, size: 19, color: ACCENT, bold: true })],
}));
children.push(new Paragraph({
  spacing: { after: 60 },
  border: { bottom: RULE },
  children: [
    new TextRun({ text: C.contact.location, size: 19, color: "333333" }),
    contactSep(),
    new TextRun({ text: C.contact.phone, size: 19, color: "333333" }),
    contactSep(),
    new TextRun({ text: C.contact.email, size: 19, color: "333333" }),
    contactSep(),
    new ExternalHyperlink({ link: C.contact.linkedin, children: [new TextRun({ text: "LinkedIn", size: 19, style: "Hyperlink" })] }),
    contactSep(),
    new ExternalHyperlink({ link: C.contact.github, children: [new TextRun({ text: "GitHub", size: 19, style: "Hyperlink" })] }),
  ],
}));

// SUMMARY
children.push(sectionHeading("Professional Summary"));
children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: C.summary, size: 20 })] }));

// SKILLS
children.push(sectionHeading("Technical Skills"));
C.skills.forEach((s) => children.push(skillLine(s.label, s.value)));

// EXPERIENCE
children.push(sectionHeading("Professional Experience"));
C.experience.forEach((role) => {
  children.push(jobHeader(role.company, role.title, role.dates));
  role.bullets.forEach((spec) => children.push(bullet(spec)));
});

// EDUCATION
children.push(sectionHeading("Education"));
C.education.forEach((e) => {
  const runs = [
    new TextRun({ text: e.degree, bold: true, size: 20 }),
    new TextRun({ text: " — " + e.institution, size: 20 }),
  ];
  if (e.detail) runs.push(new TextRun({ text: "  ·  " + e.detail, size: 20, color: "555555" }));
  children.push(new Paragraph({ spacing: { after: 24 }, children: runs }));
});

// RECOGNITION
if (C.recognition && C.recognition.length) {
  children.push(sectionHeading("Leadership & Recognition"));
  C.recognition.forEach((r) => {
    children.push(new Paragraph({
      spacing: { after: 20 },
      keepLines: true,
      children: [
        new TextRun({ text: r.bold, bold: true, size: 20 }),
        new TextRun({ text: r.rest, size: 20 }),
      ],
    }));
  });
}

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 20 } } } },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { run: { color: ACCENT }, paragraph: { indent: { left: 288, hanging: 200 } } } },
      ] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 620, right: 900, bottom: 620, left: 900 } } },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log("written: " + outPath);
});
