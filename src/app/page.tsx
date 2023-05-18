"use client";

import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import * as PDFJS from "pdfjs-dist";

PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

export default function Home() {
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleResumeFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      setResumeFile(event.target.files[0]);
    } else {
      setResumeFile(null);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!resumeFile) {
      console.error("No resume file selected");
      return;
    }

    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(resumeFile);
    fileReader.onload = async () => {
      const arrayBuffer = fileReader.result as ArrayBuffer;

      const pdf = await PDFJS.getDocument({
        data: arrayBuffer,
        useSystemFonts: true, // https://github.com/mozilla/pdf.js/issues/4244#issuecomment-1479534301
      }).promise;

      const pageTexts: string[] = [];
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const pageContent = await page.getTextContent();

        pageTexts.push(
          pageContent.items
            // limit to TextItem, extract str:
            .filter((item) => (item as any).str != null)
            .map((item) => (item as any).str as string)
            .join(" ")
        );
      }

      const resumeContent = pageTexts.join("\n").replace(/\s+/g, " ");
    };
  };

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        margin: 2,
        padding: 2,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
        }}
      >
        Cover Letter Generator
      </Typography>
      <TextField
        id="company-name"
        label="Company Name"
        placeholder="Enter company name here"
        variant="outlined"
        value={companyName}
        onChange={(event) => {
          setCompanyName(event.target.value);
        }}
      />
      <TextField
        id="job-description"
        label="Job Description"
        placeholder="Enter job description here"
        multiline
        rows={5}
        variant="outlined"
        value={jobDescription}
        onChange={(event) => {
          setJobDescription(event.target.value);
        }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          padding: 2,
          color: (theme) => theme.palette.text.secondary,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle1">Upload your Resume (PDF)</Typography>
        <input
          accept="application/pdf"
          id="resume-file"
          type="file"
          onChange={handleResumeFileChange}
        />
      </Box>
      <Button variant="contained" onClick={handleGenerateCoverLetter}>
        Generate Cover Letter
      </Button>
    </Paper>
  );
}
