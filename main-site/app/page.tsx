// pages/pages.tsx (or index.tsx)
import Head from 'next/head'
import HatRegistry from "../components/HatRegistry";


export default function Home() {
  return (
    <main style={{ padding: 10 }}>
      
      <HatRegistry />
    </main>
  );
}