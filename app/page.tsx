// app/page.tsx
import ClientHome from '../components/ClientHome';

export default function Home() {
  return (
    <div className="container">
      <main>
        <h1>Random Roster</h1>
        <ClientHome />
      </main>
    </div>
  );
}