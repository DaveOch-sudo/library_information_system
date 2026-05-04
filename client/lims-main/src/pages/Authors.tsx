/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  User as UserIcon,
  BookOpen,
  Trash2,
  Edit3,
} from "lucide-react";
import api from "../api/axios";
import { Author } from "../types";
import { DataTable } from "../components/DataTable";
import toast from "react-hot-toast";

export default function Authors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAuthors = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/authors");
      const payload = response.data.data;
      const authorList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
        ? payload.content
        : [];
      setAuthors(authorList);
    } catch (error) {
      console.error(error);
      setAuthors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/authors/${id}`);
      toast.success("Author removed successfully");
      fetchAuthors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete author");
    }
  };

  const columns = [
    {
      header: "Author Identity",
      key: "name",
      render: (author: Author) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-primary" />
          </div>
          <p className="font-bold text-slate-900">{author.name ?? "—"}</p>
        </div>
      ),
    },
    {
      header: "Biography",
      key: "bio",
      render: (author: any) => (
        <p className="text-slate-400 text-sm italic">
          {author.bio ?? "No biography provided"}
        </p>
      ),
    },
    {
      header: "Publications",
      key: "publications",
      render: (author: any) => (
        <div className="flex items-center text-xs text-slate-400">
          <BookOpen className="h-3 w-3 mr-1" />
          {author.bookCount != null
            ? `${author.bookCount} books`
            : "View Catalog"}
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (author: Author) => (
        <div className="flex space-x-2">
          <button
            className="p-2 text-slate-400 hover:text-primary transition-all"
            onClick={() => toast("Edit coming soon")}
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            className="p-2 text-slate-400 hover:text-red-500 transition-all"
            onClick={() => handleDelete(author.id)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const filtered = authors.filter((a) =>
    (a.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Authority Control
          </h1>
          <p className="text-sm text-slate-500">
            Manage contributor identities and bibliographies.
          </p>
        </div>
        <button
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit"
          onClick={() => toast("Add author coming soon")}
        >
          <Plus className="h-4 w-4" />
          Register Author
        </button>
      </header>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Filter contributing authors..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-400 whitespace-nowrap">
          {filtered.length} of {authors.length} authors
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={filtered} isLoading={isLoading} />
      </div>
    </div>
  );
}
