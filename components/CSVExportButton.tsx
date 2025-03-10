// components/CSVExportButton.tsx
"use client";

import React from "react";
import { Class, GroupingHistoryEntry } from "../types";

interface CSVExportButtonProps {
  classes: Class[];
}

const CSVExportButton: React.FC<CSVExportButtonProps> = ({ classes }) => {
  // Generate the first CSV section (Students)
  const generateStudentCSVSection = () => {
    const header = "Class Name,Student Name,Present,Capability Level";
    const rows: string[] = [];
    classes.forEach((cls) => {
      if (cls.students && cls.students.length > 0) {
        cls.students.forEach((student) => {
          const className = `"${cls.name}"`;
          const studentName = `"${student.name}"`;
          const present = student.present ? "Yes" : "No";
          const capability = student.capabilityLevel;
          rows.push(`${className},${studentName},${present},${capability}`);
        });
      } else {
        // If no students, output a row with the class name and empty columns.
        const className = `"${cls.name}"`;
        rows.push(`${className},,,`);
      }
    });
    return [header, ...rows].join("\n");
  };

  // Generate the second CSV section (Grouping History)
  const generateGroupingCSVSection = () => {
    const header =
      "Class Name,Grouping Timestamp,Grouping Method,Grouping Value,Group Details";
    const rows: string[] = [];
    classes.forEach((cls) => {
      const groupHistoryKey = `groupHistory-${cls.id}`;
      let historyEntries: GroupingHistoryEntry[] = [];
      try {
        const stored = localStorage.getItem(groupHistoryKey);
        if (stored) {
          historyEntries = JSON.parse(stored);
        }
      } catch (error) {
        console.error(
          "Error parsing group history for class",
          cls.id,
          error
        );
      }
      if (historyEntries && historyEntries.length > 0) {
        historyEntries.forEach((entry) => {
          // Format the timestamp using the browser locale.
          const ts = new Date(entry.timestamp).toLocaleString();
          const method = entry.method;
          const value = entry.value;
          // Build the group details string by joining each group’s student names.
          const groupDetails = entry.groups
            .map((group, index) => {
              const names = group.students.map((s) => s.name).join(" / ");
              return `Group ${index + 1}: ${names}`;
            })
            .join(" | ");
          const className = `"${cls.name}"`;
          const timestamp = `"${ts}"`;
          const groupDetailsEscaped = `"${groupDetails}"`;
          rows.push(
            `${className},${timestamp},${method},${value},${groupDetailsEscaped}`
          );
        });
      } else {
        // If there is no grouping history, output a row with the class name and empty columns.
        const className = `"${cls.name}"`;
        rows.push(`${className},,,,`);
      }
    });
    return [header, ...rows].join("\n");
  };

  // Combine both sections and trigger download.
  const handleExport = () => {
    const studentSection = generateStudentCSVSection();
    const groupingSection = generateGroupingCSVSection();
    const csvContent = studentSection + "\n\n" + groupingSection;
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <button onClick={handleExport}>Export Roster for randomroster.com</button>
    </div>
  );
};

export default CSVExportButton;