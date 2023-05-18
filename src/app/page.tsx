"use client";

import { useState } from "react";
import { TextField, Button } from "@mui/material";
import styles from "./page.module.css";

export default function Home() {
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

  const handleGenerateCoverLetter = () => {
    // TODO: Implement cover letter generation logic
    console.log("Generating cover letter...");
  };

  return (
    <main className={styles.main}>
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
      <input
        accept="application/pdf"
        id="resume-file"
        type="file"
        onChange={handleResumeFileChange}
      />
      <Button variant="contained" onClick={handleGenerateCoverLetter}>
        Generate Cover Letter
      </Button>
    </main>
  );
}
