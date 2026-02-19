import { searchBooks } from "@/lib/google-books";
import { createClient } from "@/lib/supabase/server";
import { BookSearchResults } from "@/components/book-search-results";
import { PopularBooks, type PopularBook } from "@/components/top/popular-books";
import { LatestReviews, type LatestReview } from "@/components/top/latest-reviews";

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

  const supabase = await createClient();

  // 人気の本用データ（全レビューと書籍情報）・最新レビューを並列取得
  const [popularRaw, latestRaw] = await Promise.all([
    supabase
      .from("reviews")
      .select(
        "user_books!inner(rating, books!inner(id, title, author, cover_image_url, google_books_id))",
      ),
    supabase
      .from("reviews")
      .select(
        "id, content, created_at, user_books!inner(rating, users!inner(id, username, avatar_url), books!inner(title, google_books_id, cover_image_url))",
      )
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  // book_id でグループ化してレビュー数と平均評価を算出
  type BookAgg = {
    id: string;
    title: string;
    author: string | null;
    coverImageUrl: string | null;
    googleBooksId: string;
    reviewCount: number;
    totalRating: number;
    ratingCount: number;
  };
  const bookMap = new Map<string, BookAgg>();

  for (const row of popularRaw.data ?? []) {
    const ub = row.user_books as unknown as {
      rating: number | null;
      books: {
        id: string;
        title: string;
        author: string | null;
        cover_image_url: string | null;
        google_books_id: string | null;
      };
    };
    const book = ub.books;
    if (!book?.google_books_id) continue;

    const existing = bookMap.get(book.id);
    if (existing) {
      existing.reviewCount++;
      if (ub.rating != null) {
        existing.totalRating += ub.rating;
        existing.ratingCount++;
      }
    } else {
      bookMap.set(book.id, {
        id: book.id,
        title: book.title,
        author: book.author,
        coverImageUrl: book.cover_image_url,
        googleBooksId: book.google_books_id,
        reviewCount: 1,
        totalRating: ub.rating ?? 0,
        ratingCount: ub.rating != null ? 1 : 0,
      });
    }
  }

  const popularBooks: PopularBook[] = Array.from(bookMap.values())
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      coverImageUrl: b.coverImageUrl,
      googleBooksId: b.googleBooksId,
      reviewCount: b.reviewCount,
      avgRating: b.ratingCount > 0 ? b.totalRating / b.ratingCount : null,
    }))
    .sort(
      (a, b) =>
        b.reviewCount - a.reviewCount || (b.avgRating ?? 0) - (a.avgRating ?? 0),
    )
    .slice(0, 5);

  // 最新レビュー整形
  const latestReviews: LatestReview[] = (latestRaw.data ?? []).map((row) => {
    const ub = row.user_books as unknown as {
      rating: number | null;
      users: { id: string; username: string; avatar_url: string | null };
      books: {
        title: string;
        google_books_id: string | null;
        cover_image_url: string | null;
      };
    };
    return {
      id: row.id,
      content: row.content,
      createdAt: row.created_at,
      rating: ub.rating,
      user: {
        id: ub.users.id,
        username: ub.users.username,
        avatarUrl: ub.users.avatar_url,
      },
      book: {
        title: ub.books.title,
        googleBooksId: ub.books.google_books_id,
        coverImageUrl: ub.books.cover_image_url,
      },
    };
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">ホンダナへようこそ</h1>
      <p className="mt-2 text-muted-foreground">
        本を通じてつながる読書コミュニティ
      </p>

      {(popularBooks.length > 0 || latestReviews.length > 0) && (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <PopularBooks books={popularBooks} />
          <LatestReviews reviews={latestReviews} />
        </div>
      )}
    </div>
  );
}
