const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

const extractResumeText = async (file) => {
  if (!file) {
    throw new Error("Resume file is required");
  }

  // PDF
  if (file.mimetype === "application/pdf") {
    const parser = new PDFParse({
      data: file.buffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    return result.text.trim();
  }

  // DOCX
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    return result.value.trim();
  }

  throw new Error("Unsupported resume format");
};

module.exports = extractResumeText;