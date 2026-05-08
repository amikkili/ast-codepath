// lib/certificate.js  ← NEW FILE
// Generates a branded PDF certificate using pdf-lib.
// Returns the PDF as a Buffer (bytes) that can be attached to emails.
// ─────────────────────────────────────────────────────────────────────────────

export async function generateCertificatePDF({ studentName, courseName, issuedAt, certificateId }) {
  // Dynamic import — pdf-lib only runs on server (API routes)
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')

  const doc  = await PDFDocument.create()
  const page = doc.addPage([842, 595]) // A4 landscape

  // ── Fonts ─────────────────────────────────────────────────────────────────
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold    = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontItalic  = await doc.embedFont(StandardFonts.HelveticaOblique)

  const { width, height } = page.getSize()

  // ── Background ────────────────────────────────────────────────────────────
  page.drawRectangle({
    x: 0, y: 0, width, height,
    color: rgb(0.059, 0.067, 0.090),  // #0f1117
  })

  // ── Outer decorative border ───────────────────────────────────────────────
  page.drawRectangle({
    x: 20, y: 20, width: width - 40, height: height - 40,
    borderColor: rgb(0.325, 0.290, 0.718),  // #534AB7
    borderWidth: 0.5,
    color: rgb(0, 0, 0, 0),
  })
  // Inner border
  page.drawRectangle({
    x: 26, y: 26, width: width - 52, height: height - 52,
    borderColor: rgb(0.325, 0.290, 0.718, 0.3),
    borderWidth: 0.3,
    color: rgb(0, 0, 0, 0),
  })

  // ── Company name top ──────────────────────────────────────────────────────
  const companyText = 'ANIL SOFTWARE TECHNOLOGIES'
  const companyW    = fontBold.widthOfTextAtSize(companyText, 11)
  page.drawText(companyText, {
    x: (width - companyW) / 2,
    y: height - 70,
    size: 11,
    font: fontBold,
    color: rgb(0.325, 0.290, 0.718),
    characterSpacing: 2,
  })

  // ── Product name ──────────────────────────────────────────────────────────
  const productText = 'CodePath Learning Platform'
  const productW    = fontRegular.widthOfTextAtSize(productText, 9)
  page.drawText(productText, {
    x: (width - productW) / 2,
    y: height - 86,
    size: 9,
    font: fontRegular,
    color: rgb(0.533, 0.537, 0.641),
  })

  // ── Decorative line ───────────────────────────────────────────────────────
  page.drawLine({
    start: { x: width / 2 - 80, y: height - 100 },
    end:   { x: width / 2 + 80, y: height - 100 },
    thickness: 1,
    color: rgb(0.325, 0.290, 0.718),
  })

  // ── "Certificate of Completion" heading ───────────────────────────────────
  const headText = 'CERTIFICATE OF COMPLETION'
  const headW    = fontBold.widthOfTextAtSize(headText, 9)
  page.drawText(headText, {
    x: (width - headW) / 2,
    y: height - 128,
    size: 9,
    font: fontBold,
    color: rgb(0.533, 0.537, 0.641),
    characterSpacing: 3,
  })

  // ── "This is to certify that" ─────────────────────────────────────────────
  const certifyText = 'This is to certify that'
  const certifyW    = fontRegular.widthOfTextAtSize(certifyText, 12)
  page.drawText(certifyText, {
    x: (width - certifyW) / 2,
    y: height - 180,
    size: 12,
    font: fontRegular,
    color: rgb(0.533, 0.537, 0.641),
  })

  // ── Student name (large italic) ───────────────────────────────────────────
  const nameSize = studentName.length > 25 ? 32 : 38
  const nameW    = fontItalic.widthOfTextAtSize(studentName, nameSize)
  page.drawText(studentName, {
    x: (width - nameW) / 2,
    y: height - 228,
    size: nameSize,
    font: fontItalic,
    color: rgb(0.886, 0.906, 0.941),
  })

  // ── Name underline ────────────────────────────────────────────────────────
  page.drawLine({
    start: { x: width / 2 - 150, y: height - 238 },
    end:   { x: width / 2 + 150, y: height - 238 },
    thickness: 0.5,
    color: rgb(0.325, 0.290, 0.718, 0.5),
  })

  // ── "has successfully completed" ─────────────────────────────────────────
  const completedText = 'has successfully completed the course'
  const completedW    = fontRegular.widthOfTextAtSize(completedText, 12)
  page.drawText(completedText, {
    x: (width - completedW) / 2,
    y: height - 268,
    size: 12,
    font: fontRegular,
    color: rgb(0.533, 0.537, 0.641),
  })

  // ── Course name (highlighted) ─────────────────────────────────────────────
  const courseSize = courseName.length > 30 ? 20 : 24
  const courseW    = fontBold.widthOfTextAtSize(courseName, courseSize)
  page.drawText(courseName, {
    x: (width - courseW) / 2,
    y: height - 308,
    size: courseSize,
    font: fontBold,
    color: rgb(0.498, 0.467, 0.867),  // #7f77dd
  })

  // ── Divider ───────────────────────────────────────────────────────────────
  page.drawLine({
    start: { x: width / 2 - 60, y: height - 336 },
    end:   { x: width / 2 + 60, y: height - 336 },
    thickness: 1.5,
    color: rgb(0.325, 0.290, 0.718),
  })

  // ── Signature section ──────────────────────────────────────────────────────
  // Left: CEO signature
  const sigY = height - 400
  page.drawLine({
    start: { x: 180, y: sigY + 28 },
    end:   { x: 340, y: sigY + 28 },
    thickness: 0.5,
    color: rgb(0.165, 0.184, 0.243),
  })
  const ceoNameW = fontBold.widthOfTextAtSize('Anil Kumar Mikkili', 11)
  page.drawText('Anil Kumar Mikkili', {
    x: 260 - ceoNameW / 2, y: sigY + 10,
    size: 11, font: fontBold,
    color: rgb(0.784, 0.816, 0.878),
  })
  const ceoRoleW = fontRegular.widthOfTextAtSize('CEO & Founder, AST', 9)
  page.drawText('CEO & Founder, AST', {
    x: 260 - ceoRoleW / 2, y: sigY - 4,
    size: 9, font: fontRegular,
    color: rgb(0.353, 0.384, 0.455),
  })

  // Right: Platform signature
  page.drawLine({
    start: { x: 500, y: sigY + 28 },
    end:   { x: 660, y: sigY + 28 },
    thickness: 0.5,
    color: rgb(0.165, 0.184, 0.243),
  })
  const platformW = fontBold.widthOfTextAtSize('CodePath Platform', 11)
  page.drawText('CodePath Platform', {
    x: 580 - platformW / 2, y: sigY + 10,
    size: 11, font: fontBold,
    color: rgb(0.784, 0.816, 0.878),
  })
  const verifiedW = fontRegular.widthOfTextAtSize('Verified Certificate', 9)
  page.drawText('Verified Certificate', {
    x: 580 - verifiedW / 2, y: sigY - 4,
    size: 9, font: fontRegular,
    color: rgb(0.353, 0.384, 0.455),
  })

  // ── Issue date + Certificate ID ───────────────────────────────────────────
  const dateStr   = new Date(issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  const footerText = `Issued on: ${dateStr}   ·   Certificate ID: ${certificateId}   ·   www.anilsofttech.com`
  const footerW    = fontRegular.widthOfTextAtSize(footerText, 8)
  page.drawText(footerText, {
    x: (width - footerW) / 2,
    y: 52,
    size: 8,
    font: fontRegular,
    color: rgb(0.353, 0.384, 0.455),
  })

  // ── Corner decorations ────────────────────────────────────────────────────
  const corners = [[36,36],[width-36,36],[36,height-36],[width-36,height-36]]
  for (const [cx, cy] of corners) {
    page.drawCircle({ x: cx, y: cy, size: 3, color: rgb(0.325, 0.290, 0.718) })
  }

  const pdfBytes = await doc.save()
  return Buffer.from(pdfBytes)
}
