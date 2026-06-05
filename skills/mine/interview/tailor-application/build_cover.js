// Data-driven cover-letter generator.
// Usage: NODE_PATH=<global modules> node build_cover.js <content.json> <out.docx>
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, ExternalHyperlink, BorderStyle } = require("docx");

const contentPath = process.argv[2] || "cover-content.json";
const outPath = process.argv[3] || "Cover Letter.docx";
const C = JSON.parse(fs.readFileSync(contentPath, "utf8"));

const ACCENT = "1F3A5F";
const RULE = { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 };
const contactSep = () => new TextRun({ text: "  |  ", color: "666666" });

// Run spec: { t: "normal" } | { b: "bold" } | { ph: "placeholder (accent bold)" }
function runsFromSpec(spec) {
  return spec.map((s) => {
    if (s.b !== undefined) return new TextRun({ text: s.b, size: 21, bold: true });
    if (s.ph !== undefined) return new TextRun({ text: s.ph, size: 21, color: ACCENT, bold: true });
    return new TextRun({ text: s.t, size: 21 });
  });
}

const children = [];

// HEADER
children.push(new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: C.name, bold: true, size: 40, color: "1A1A1A" })] }));
children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: C.tagline, size: 18, color: ACCENT, bold: true })] }));
children.push(new Paragraph({
  spacing: { after: 200 },
  border: { bottom: RULE },
  children: [
    new TextRun({ text: C.contact.location, size: 18, color: "333333" }),
    contactSep(),
    new TextRun({ text: C.contact.phone, size: 18, color: "333333" }),
    contactSep(),
    new TextRun({ text: C.contact.email, size: 18, color: "333333" }),
    contactSep(),
    new ExternalHyperlink({ link: C.contact.linkedin, children: [new TextRun({ text: "LinkedIn", size: 18, style: "Hyperlink" })] }),
    contactSep(),
    new ExternalHyperlink({ link: C.contact.github, children: [new TextRun({ text: "GitHub", size: 18, style: "Hyperlink" })] }),
  ],
}));

// HOW-TO-USE BOX (template chrome; delete before sending)
if (C.showHowToUse) {
  const boxBorder = { style: BorderStyle.SINGLE, size: 4, color: "C9D2DD", space: 6 };
  children.push(new Paragraph({
    spacing: { after: 220 },
    shading: { type: "clear", fill: "F2F4F7" },
    border: { top: boxBorder, bottom: boxBorder, left: boxBorder, right: boxBorder },
    children: [
      new TextRun({ text: "HOW TO USE (delete this box before sending): ", bold: true, size: 17, color: ACCENT }),
      new TextRun({ text: "Replace every ", size: 17, color: "555555" }),
      new TextRun({ text: "[bracketed blue]", size: 17, color: ACCENT, bold: true }),
      new TextRun({ text: " field. Keep paragraph 1 and the final paragraph tailored to the specific company/role; paragraphs 2–3 are reusable. Aim for one page.", size: 17, color: "555555" }),
    ],
  }));
}

// BODY BLOCKS
C.blocks.forEach((blk) => {
  children.push(new Paragraph({
    spacing: { after: blk.after !== undefined ? blk.after : 180, line: 276 },
    children: runsFromSpec(blk.runs),
  }));
});

// SIGN-OFF
children.push(new Paragraph({ spacing: { after: 40, line: 276 }, children: [new TextRun({ text: C.signoff, size: 21 })] }));
children.push(new Paragraph({ children: [new TextRun({ text: C.name, bold: true, size: 21 })] }));

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 21 } } } },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log("written: " + outPath);
});
