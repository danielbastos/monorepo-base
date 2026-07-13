"use client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main>
      <h1>Algo deu errado</h1>
      <button type="button" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
