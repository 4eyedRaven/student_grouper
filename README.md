
# Student Grouping App

The Student Grouping App is a web application designed for teachers to manage classes and group students effectively. It allows teachers to create classes, add students with varying capability levels, and generate balanced student groups based on specified criteria.

**The app is available for testing at [https://student-grouper.vercel.app/](https://student-grouper.vercel.app/).**

## Features

- **Class Management**
  - Add new classes.
  - Delete existing classes.
  - Switch between different classes.
  
- **Student Management**
  - Add students to a class with specified capability levels (High, Medium, Low).
  - Mark students as present or absent using a “Present” toggle.
  - Remove students from a class.
  
- **Grouping Tool**
  - Generate student groups based on:
    - Number of groups.
    - Number of students per group.
  - Ensure groups are numerically balanced and have a mix of capability levels.
  - Display generated groups in a modal dialog (lightbox) for easy viewing.
  - Close the modal by clicking outside, clicking the close button, or pressing the Escape key.

## Technologies Used

- **Framework**: Next.js (React framework)
- **Language**: TypeScript
- **Styling**: CSS with custom variables
- **State Management**: React hooks (useState, useEffect)
- **Data Persistence**: localStorage for saving classes and students

## Getting Started

### Prerequisites

- **Node.js**: Make sure you have Node.js installed (version 14 or later).
- **npm**: Comes with Node.js. Alternatively, you can use yarn or pnpm.

### Installation

1. **Clone the Repository**
    ```bash
    git clone https://github.com/4eyedRaven/student_grouper.git
    cd student-grouping-app
    ```

2. **Install Dependencies**

   Using npm:
    ```bash
    npm install
    ```

   Or using yarn:
    ```bash
    yarn install
    ```

   Or using pnpm:
    ```bash
    pnpm install
    ```

### Running the Development Server

Start the development server:
```bash
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Class Management

- **Add a New Class**
  - Enter the class name in the “New class name” input field.
  - Press Enter or click the + button.
- **Switch Between Classes**
  - Click on a class name in the list to select it.
- **Delete a Class**
  - Click the × button next to the class name.
  - Confirm deletion if prompted.

### Student Management

- **Add a New Student**
  - Enter the student’s name in the “New student name” input field.
  - Select the capability level from the dropdown (High, Medium, Low).
  - Press Enter or click the Add Student button.
- **Mark Student as Present/Absent**
  - Use the “Present” checkbox next to the student’s name to toggle their attendance.
- **Remove a Student**
  - Click the Remove button in the “Actions” column next to the student’s name.

### Grouping Students

- **Select Grouping Criteria**
  - Choose between:
    - By Number of Groups: Specify how many groups to create.
    - By Students per Group: Specify how many students should be in each group.
- **Generate Groups**
  - Click the Generate Groups button.
- **View Generated Groups**
  - The groups will appear in a modal dialog.
  - Review the groups, which are balanced by number and capability levels.
- **Close the Modal**
  - Click the × button in the top-right corner.
  - Click outside the modal content.
  - Press the Escape key.

## Project Structure

```
student-grouping-app/
├── components/
│   ├── ClassManager.tsx
│   ├── StudentManager.tsx
│   └── GroupingTool.tsx
├── pages/
│   ├── _app.tsx
│   └── index.tsx
├── styles/
│   └── globals.css
├── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

- **components/**: Contains React components for class management, student management, and the grouping tool.
- **pages/**: Next.js pages, including the main index.tsx file.
- **styles/**: Global CSS styles.
- **types.ts**: TypeScript interfaces for Class and Student.
- **package.json**: Project metadata and dependencies.
- **tsconfig.json**: TypeScript configuration.

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for linting errors.

## Dependencies

- `react`: "^18.x"
- `react-dom`: "^18.x"
- `next`: "^12.x" or later
- `typescript`: "^4.x" (as a dev dependency)
- `@types/react`: "^17.x" (as a dev dependency)
- `@types/react-dom`: "^17.x" (as a dev dependency)
- `eslint`: "^7.x" (as a dev dependency)
- `eslint-config-next`: "^11.x" (as a dev dependency)

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch**
    ```bash
    git checkout -b feature/YourFeature
    ```

3. **Commit Your Changes**
    ```bash
    git commit -m "Add your message"
    ```

4. **Push to the Branch**
    ```bash
    git push origin feature/YourFeature
    ```

5. **Open a Pull Request**

## License

This project is licensed under the MIT License.

## Acknowledgments

- Thanks to all contributors and users who have provided feedback and suggestions (my wife).
- Built with Next.js and TypeScript.
