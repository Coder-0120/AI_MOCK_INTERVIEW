const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const extractResumeText = async (file) => {
  if (!file) {
    throw new Error("Resume file is required");
  }

  // PDF
  if (file.mimetype === "application/pdf") {
    const data = await pdfParse(file.buffer);

    return data.text.trim();
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