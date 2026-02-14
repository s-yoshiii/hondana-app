import { searchBooks } from "@/lib/google-books";
import { BookSearchResults } from "@/components/book-search-results";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  if (query) {
    const books = await searchBooks(query);
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <BookSearchResults query={query} books={books} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">ホンダナへようこそ</h1>
      <p className="mt-2 text-muted-foreground">
        本を通じてつながる読書コミュニティ
      </p>
    </div>
  );
}
