"use client";

import { extractTopicAndExcludeChatPrompt } from "@lgrammel/ai-utils/prompt";
import { createOpenAIChatModel } from "@lgrammel/ai-utils/provider/openai";
import {
  generateText,
  splitMapFilterReduce,
  splitRecursivelyAtCharacter,
} from "@lgrammel/ai-utils/text";
import { retryWithExponentialBackoff } from "@lgrammel/ai-utils/util";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import * as PDFJS from "pdfjs-dist";
import { useState } from "react";

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

  const loadFileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = () => {
        resolve(fileReader.result as ArrayBuffer);
      };
      fileReader.onerror = () => {
        reject(fileReader.error);
      };
    });
  };

  const handleGenerateCoverLetter = async () => {
    if (!resumeFile) {
      console.error("No resume file selected");
      return;
    }

    try {
      const pdfData = await loadFileToArrayBuffer(resumeFile);
      const resumeContent = await getTextFromPdf(pdfData);
      const skills = await extractSkillsFromResume(resumeContent);

      console.log(resumeContent, skills);
    } catch (error) {
      console.error(error);
    }
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

async function extractSkillsFromResume(resumeContent: string) {
  const gpt4 = createOpenAIChatModel({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "",
    model: "gpt-4",
  });

  const extractTopicFromREsume = splitMapFilterReduce.asMapFunction({
    split: splitRecursivelyAtCharacter.asSplitFunction({
      maxChunkSize: 1024 * 4,
    }),
    map: generateText.asFunction({
      model: gpt4,
      prompt: extractTopicAndExcludeChatPrompt({
        topic: "Skills and Experience",
        excludeKeyword: "IRRELEVANT",
      }),
      retry: retryWithExponentialBackoff({
        maxTries: 5,
        delay: 4000,
      }),
    }),
    filter: (text) => text !== "IRRELEVANT",
    reduce: generateText.asFunction({
      functionId: "rewrite",
      model: gpt4,
      prompt: async ({ text }) => [
        {
          role: "user" as const,
          content: `## TOPIC\nSkills and Experience`,
        },
        {
          role: "system" as const,
          content: `## TASK
Rewrite the content below into a list of skills and experiences.
Discard all irrelevant information.`,
        },
        {
          role: "user" as const,
          content: `## CONTENT\n${text}`,
        },
      ],
    }),
  });

  return await extractTopicFromREsume(
    {
      text: resumeContent,
    },
    {
      recordCallStart: (record) => {
        console.log(record);
      },
      recordCallEnd: (record) => {
        console.log(record);
      },
    }
  );
}

async function getTextFromPdf(arrayBuffer: ArrayBuffer) {
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

  return pageTexts.join("\n").replace(/\s+/g, " ");
}
