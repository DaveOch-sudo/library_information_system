/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit3, Trash2, BookOpen, Tag, Hash } from 'lucide-react';
import api from '../api/axios';
import { Book } from '../types';
import { DataTable } from '../components/DataTable';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/books');
      setBooks(response.data);
    } catch (error) {
      toast.error('Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await api.delete(`/books/${id}`);
      toast.success('Book deleted');
      fetchBooks();
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const columns = [
    { 
      header: 'Book Info', 
      key: 'title',
      render: (book: Book) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-8 bg-slate-200 rounded flex-shrink-0 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-primary body-md">{book.title}</p>
            <p className="text-xs text-slate-500">ISBN: {book.isbn}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Author & Category', 
      key: 'author',
      render: (book: Book) => (
        <div className="space-y-1">
          <div className="flex items-center text-xs text-slate-600">
            <Edit3 className="h-3 w-3 mr-1" /> {book.author?.name}
          </div>
          <div className="flex items-center text-xs text-slate-400">
            <Tag className="h-3 w-3 mr-1" /> {book.category?.name}
          </div>
        </div>
      )
    },
    { 
      header: 'Inventory', 
      key: 'quantity',
      render: (book: Book) => (
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-bold">In Stock</p>
            <p className="font-bold text-slate-700">{book.availableCopies}/{book.quantity}</p>
          </div>
          <div className="h-8 w-px bg-slate-100"></div>
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-bold">Shelf</p>
            <p className="font-bold text-secondary">{book.shelf?.locationCode}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Status', 
      key: 'status',
      render: (book: Book) => (
        <span className={cn(
          "px-2 py-1 rounded text-[10px] font-bold uppercase",
          book.status === 'ACTIVE' ? "bg-teal-50 text-teal-600" :
          book.status === 'MAINTENANCE' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
        )}>
          {book.status}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (book: Book) => (
        <div className="flex space-x-2">
          <button className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-100 rounded">
            <Edit3 className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleDelete(book.id)}
            className="p-2 text-slate-400 hover:text-error transition-colors hover:bg-slate-100 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.isbn.includes(searchTerm));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resource Catalog</h1>
          <p className="text-sm text-slate-500">Manage institutional catalogs and inventories.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit shadow-sm shadow-blue-100">
          <Plus className="h-4 w-4" />
          Add Resource
        </button>
      </header>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="px-3 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg flex items-center hover:bg-slate-50 transition-all font-medium text-sm">
            <Filter className="mr-2 h-4 w-4 text-slate-400" /> Filter
          </button>
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Hash className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={filteredBooks} isLoading={isLoading} />
      </div>
    </div>
  );
}

