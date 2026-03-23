import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Books = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState('');
  const [days, setDays] = useState(14);
  const [form, setForm] = useState({
    title: '', author: '', isbn: '', genre: '', total_copies: 1
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBooks = async () => {
    try {
      const res = await API.get('/books');
      setBooks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await API.get('/members');
      setMembers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBooks();
    if (user?.role === 'admin') fetchMembers();
  }, []);

  const handleAddBook = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/books', form);
      setSuccess('Book added successfully!');
      setShowForm(false);
      setForm({ title: '', author: '', isbn: '', genre: '', total_copies: 1 });
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add book.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await API.delete(`/books/${id}`);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const openBorrowForm = (book) => {
    setSelectedBook(book);
    setSelectedMember(user?.role === 'member' ? user.id : '');
    setShowBorrowForm(true);
    setError('');
    setSuccess('');
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/reservations', {
        book_id: selectedBook.id,
        member_id: user?.role === 'admin' ? selectedMember : user.id,
        days: parseInt(days),
      });
      setSuccess(`"${selectedBook.title}" borrowed successfully! Due in ${days} days.`);
      setShowBorrowForm(false);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to borrow book.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Books</h2>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
            >
              {showForm ? 'Cancel' : '+ Add Book'}
            </button>
          )}
        </div>

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleAddBook} className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-2 gap-4">
            <input required placeholder="Title" value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input required placeholder="Author" value={form.author}
              onChange={e => setForm({...form, author: e.target.value})}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input required placeholder="ISBN" value={form.isbn}
              onChange={e => setForm({...form, isbn: e.target.value})}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Genre" value={form.genre}
              onChange={e => setForm({...form, genre: e.target.value})}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" min="1" placeholder="Copies" value={form.total_copies}
              onChange={e => setForm({...form, total_copies: e.target.value})}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit"
              className="bg-blue-700 text-white rounded-lg py-2 hover:bg-blue-800 font-medium">
              Save Book
            </button>
          </form>
        )}

        {showBorrowForm && selectedBook && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Borrow a Book</h3>
              <p className="text-gray-500 text-sm mb-4">
                "{selectedBook.title}" by {selectedBook.author}
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 px-3 py-2 rounded mb-3 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleBorrow} className="space-y-4">
                {user?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Member
                    </label>
                    <select
                      required
                      value={selectedMember}
                      onChange={e => setSelectedMember(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Choose a member --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Duration (days)
                  </label>
                  <select
                    value={days}
                    onChange={e => setDays(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={21}>21 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </div>

                <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700">
                  Due date: <strong>
                    {new Date(Date.now() + days * 86400000).toDateString()}
                  </strong>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBorrowForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 font-medium"
                  >
                    Confirm Borrow
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading books...</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Author</th>
                  <th className="px-4 py-3 text-left">Genre</th>
                  <th className="px-4 py-3 text-left">Available</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{book.title}</td>
                    <td className="px-4 py-3 text-gray-600">{book.author}</td>
                    <td className="px-4 py-3 text-gray-600">{book.genre}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.available_copies > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {book.available_copies}/{book.total_copies}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-3 items-center">
                      {book.available_copies > 0 ? (
                        <button
                          onClick={() => openBorrowForm(book)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700"
                        >
                          Borrow
                        </button>
                      ) : (
                        <span className="text-xs text-red-400">Not available</span>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {books.length === 0 && (
              <p className="text-center text-gray-400 py-8">No books found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;