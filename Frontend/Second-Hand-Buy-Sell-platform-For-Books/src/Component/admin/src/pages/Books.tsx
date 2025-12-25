import { useState, useRef } from 'react';

const initialBooks = [
  {
    id: 1,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'Fiction',
    condition: 'Used',
    price: 'Rs. 200',
    status: 'Available',
  },
  {
    id: 2,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Fiction',
    condition: 'New',
    price: 'Rs. 300',
    status: 'Sold',
  },
  {
    id: 3,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    category: 'Classic',
    condition: 'Good',
    price: 'Rs. 250',
    status: 'Available',
  },
  {
    id: 4,
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    category: 'Fantasy',
    condition: 'Used',
    price: 'Rs. 300',
    status: 'Reserved',
  },
  {
    id: 5,
    title: "Harry Potter and the Philosopher's Stone",
    author: 'J.K. Rowling',
    category: 'Fantasy',
    condition: 'Like New',
    price: 'Rs. 350',
    status: 'Available',
  },
];

const statusColors = {
  Available: 'bg-green-100 text-green-800',
  Sold: 'bg-black text-white',
  Reserved: 'bg-yellow-100 text-yellow-800',
};

export default function Books() {
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null); // book id
  const [form, setForm] = useState({
    title: '',
    author: '',
    category: '',
    condition: '',
    price: '',
    status: 'Available',
  });
  const [error, setError] = useState('');
  const addBtnRef = useRef(null);

  // Filter books by search
  const filteredBooks = books.filter((book) => {
    const q = search.toLowerCase();
    return (
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.category.toLowerCase().includes(q)
    );
  });

  // Handle add book
  const handleAddBook = (e) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.category || !form.condition || !form.price) {
      setError('All fields are required.');
      return;
    }
    setBooks((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        ...form,
      },
    ]);
    setForm({ title: '', author: '', category: '', condition: '', price: '', status: 'Available' });
    setShowAddModal(false);
    setError('');
  };

  // Handle status change
  const handleStatusChange = (id, status) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id ? { ...book, status } : book
      )
    );
    setDropdownOpen(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-1">Books Management</h1>
          <p className="text-lg text-muted-foreground">Manage your second hand books inventory</p>
        </div>
        <button
          ref={addBtnRef}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-semibold text-lg hover:bg-primary/90 transition-colors"
          onClick={() => setShowAddModal(true)}
        >
          AddBooks
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-end mb-2">
        <input
          type="text"
          placeholder="Search by title, author, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        />
      </div>

      {/* Books Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-border rounded-lg">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-base font-semibold text-foreground border-b">Title</th>
              <th className="px-4 py-3 text-left text-base font-semibold text-foreground border-b">Author</th>
              <th className="px-4 py-3 text-left text-base font-semibold text-foreground border-b">Category</th>
              <th className="px-4 py-3 text-left text-base font-semibold text-foreground border-b">Condition</th>
              <th className="px-4 py-3 text-left text-base font-semibold text-foreground border-b">Price</th>
              <th className="px-4 py-3 text-left text-base font-semibold text-foreground border-b">Status</th>
              <th className="px-4 py-3 text-left text-base font-semibold text-foreground border-b">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredBooks.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">No books found.</td>
              </tr>
            ) : (
              filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 whitespace-pre-line font-semibold text-foreground">{book.title}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{book.author}</td>
                  <td className="px-4 py-3 text-foreground">{book.category}</td>
                  <td className="px-4 py-3 text-foreground">{book.condition}</td>
                  <td className="px-4 py-3 text-foreground">{book.price}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-4 py-1 rounded-full font-semibold text-sm ${statusColors[book.status] || 'bg-gray-200 text-gray-800'}`}>{book.status}</span>
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      className="p-1 hover:bg-muted rounded-md"
                      onClick={() => setDropdownOpen(dropdownOpen === book.id ? null : book.id)}
                      aria-label="Actions"
                      type="button"
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="18" r="1"/></svg>
                    </button>
                    {dropdownOpen === book.id && (
                      <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-md shadow-lg z-10">
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-muted text-sm"
                          onClick={() => handleStatusChange(book.id, 'Available')}
                        >
                          Available
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-muted text-sm"
                          onClick={() => handleStatusChange(book.id, 'Sold')}
                        >
                          Sold
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-muted text-sm"
                          onClick={() => handleStatusChange(book.id, 'Reserved')}
                        >
                          Reserved
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 p-1 hover:bg-muted rounded"
              onClick={() => { setShowAddModal(false); setError(''); }}
              aria-label="Close"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h2 className="text-xl font-semibold mb-4">Add Book</h2>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Author</label>
                <input
                  type="text"
                  name="author"
                  value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Condition</label>
                <input
                  type="text"
                  name="condition"
                  value={form.condition}
                  onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="text"
                  name="price"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Add Book
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}