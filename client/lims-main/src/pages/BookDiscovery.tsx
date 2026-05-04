/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import {
  Search,
  Grid,
  List as ListIcon,
  Star,
  ArrowRight,
  Bookmark,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Book } from "../types";
import toast from "react-hot-toast";
import { cn } from "../utils/cn";

export default function BookDiscovery() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/books");
        // paginated: data.data.content holds the array
        const payload = response.data.data;
        const bookList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.content)
          ? payload.content
          : [];
        setBooks(bookList);
      } catch (error) {
        console.error(error);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleBorrow = async (bookId: number) => {
    try {
      await api.post(`/loans/borrow/${bookId}`);
      toast.success("Borrowing request initiated!");
      // refresh books so availableCopies updates
      const response = await api.get("/books");
      const payload = response.data.data;
      setBooks(Array.isArray(payload) ? payload : payload?.content ?? []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to borrow book");
    }
  };

  // backend returns flat authorName/categoryName strings, not nested objects
  const filteredBooks = books.filter(
    (b: any) =>
      b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="relative bg-slate-900 text-white p-10 md:p-14 rounded-2xl overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="space-y-2">
            <span className="text-blue-400 font-bold text-[10px] tracking-[0.2em] uppercase">
              Discovery Engine
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              Explore our vast academic collection.
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-md">
              Search across {books.length}+ volumes, periodicals, and digital
              resources.
            </p>
          </div>

          <div className="relative max-w-lg group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5 group-focus-within:text-primary transition-colors" />
            <input
              className="w-full pl-12 pr-6 py-4 bg-white text-slate-900 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-2xl text-base placeholder:text-slate-400"
              placeholder="Search by title, author or ISBN..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-10 pointer-events-none">
          <BookOpen className="h-[120%] w-full text-white transform rotate-12 translate-x-1/4" />
        </div>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-2 rounded-xl border border-slate-200 gap-4">
        <div className="flex p-1 bg-slate-50 rounded-lg w-full sm:w-auto">
          {["Recommended", "Most Popular", "Recently Added"].map((tab, i) => (
            <button
              key={i}
              className={cn(
                "px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap",
                i === 0
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">
            Layout
          </span>
          <div className="flex bg-slate-50 p-1 rounded-lg">
            <button className="p-1.5 bg-white text-primary rounded shadow-sm">
              <Grid className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-96 bg-slate-100 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="h-12 w-12 text-slate-200 mb-4" />
          <h3 className="font-bold text-slate-700 mb-1">No books found</h3>
          <p className="text-slate-400 text-sm">
            {searchTerm
              ? `No results for "${searchTerm}"`
              : "No books available at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book: any) => (
            <div
              key={book.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
            >
              <div className="h-52 bg-slate-50 relative overflow-hidden flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                <BookOpen className="h-16 w-16 text-slate-200 group-hover:scale-110 transition-transform duration-500" />

                <div className="absolute top-3 left-3 flex gap-2">
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 flex items-center shadow-sm border border-slate-100">
                    <Star className="h-3 w-3 text-amber-500 fill-current mr-1" />
                    4.9
                  </div>
                </div>

                {book.availableCopies === 0 && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-4">
                    <span className="bg-white text-red-600 font-bold px-3 py-1.5 rounded-md text-[10px] uppercase shadow-xl tracking-wider">
                      Out of Stock
                    </span>
                  </div>
                )}

                <button
                  onClick={() => handleBorrow(book.id)}
                  disabled={book.availableCopies === 0}
                  className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 disabled:hidden"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col space-y-3">
                <div className="space-y-1">
                  <span className="text-blue-600 font-bold text-[9px] uppercase tracking-widest">
                    {book.categoryName ?? "Uncategorized"}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-slate-500 text-xs">
                    <span className="text-slate-400">by</span>{" "}
                    {book.authorName ?? "Unknown Author"}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">
                      Availability
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        book.availableCopies > 0
                          ? "text-emerald-600"
                          : "text-red-500"
                      )}
                    >
                      {book.availableCopies} Copies
                    </span>
                  </div>
                  <button
                    onClick={() => handleBorrow(book.id)}
                    disabled={book.availableCopies === 0}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary px-3 py-1.5 bg-blue-50/50 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100/50 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                  >
                    Borrow <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
