// app/page.tsx
import ClientHome from '../components/ClientHome';

export default function Home() {
  return (
    <div className="container">
      <main>
        <h1>Student Grouping App</h1>
        <ClientHome />
      </main>
    </div>
  );
}