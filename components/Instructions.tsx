// components/Instructions.tsx
"use client";

import React from 'react';

interface InstructionsProps {
  isPopover?: boolean;
  onClose?: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ isPopover = false, onClose }) => {
  return (
    <div className={`instructions ${isPopover ? 'instructions-popover' : ''}`}>
      {isPopover && (
        <button 
          className="close-button" 
          onClick={onClose}
          aria-label="Close instructions"
        >
          &times;
        </button>
      )}
      <h2>Welcome to the Student Grouping App!</h2>
      <p>
        This application helps you manage your classes and students, and generate balanced groups effortlessly. Here&apos;s how to get started:
      </p>
      <ol>
        <li>
          <strong>Add a Class:</strong> Enter the name of your class and click the &quot;+&quot; button to create a new class.
        </li>
        <li>
          <strong>Add Students:</strong> Select the class you&apos;ve created, enter student names along with their capability levels, and add them to the class.
        </li>
        <li>
          <strong>Generate Groups:</strong> Use the &quot;Generate Groups&quot; feature to create balanced groups based on your selected criteria.
        </li>
        <li>
          <strong>View Previous Groupings:</strong> Access your saved groupings from the &quot;Previous Groupings&quot; list to review or reuse them.
        </li>
        <li>
          <strong>Edit Groups:</strong> Easily rearrange students between groups using the drag-and-drop functionality and rename groups as needed.
        </li>
      </ol>
      <p>
        Start by adding your first class to unlock all features!
      </p>
    </div>
  );
};

export default Instructions;
