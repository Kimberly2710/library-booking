import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const res = await API.get('/reservations');
      setReservations(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleReturn = async (id) => {
    if (!window.confirm('Mark this book as returned?')) return;
    try {
      await API.patch(`/reservations/${id}/return`);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return.');
    }
  };

  const statusColor = {
    active: 'bg-blue-100 text-blue-700',
    returned: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Reservations</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Book</th>
                  <th className="px-4 py-3 text-left">Borrowed</th>
                  <th className="px-4 py-3 text-left">Due</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.member_name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.book_title}</td>
                    <td className="px-4 py-3 text-gray-600">{r.borrowed_date?.split('T')[0]}</td>
                    <td className="px-4 py-3 text-gray-600">{r.due_date?.split('T')[0]}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status !== 'returned' && (
                        <button
                          onClick={() => handleReturn(r.id)}
                          className="text-blue-600 hover:underline text-xs font-medium"
                        >
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reservations.length === 0 && (
              <p className="text-center text-gray-400 py-8">No reservations found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;