import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    books: 0, members: 0, reservations: 0, overdue: 0
  });
  const [recentReservations, setRecentReservations] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [books, reservations] = await Promise.all([
          API.get('/books'),
          API.get('/reservations'),
        ]);

        let members = { data: { data: [] } };
        if (user?.role === 'admin') {
          members = await API.get('/members');
        }

        const overdue = reservations.data.data.filter(
          r => r.status === 'overdue'
        ).length;

        setStats({
          books: books.data.data.length,
          members: members.data.data.length,
          reservations: reservations.data.data.length,
          overdue,
        });

        setRecentReservations(reservations.data.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
  { label: 'Total Books', value: stats.books, color: 'bg-gray-900', icon: '📚' },
  { label: 'Members', value: stats.members, color: 'bg-gray-700', icon: '👥' },
  { label: 'Reservations', value: stats.reservations, color: 'bg-gray-500', icon: '📋' },
  { label: 'Overdue', value: stats.overdue, color: 'bg-gray-400', icon: '⚠️' },
];

  const statusColor = {
    active: 'bg-blue-100 text-blue-700',
    returned: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            Good day, {user?.name}! 👋
          </h2>
          <p className="text-slate-500 mt-1">
            Here is what is happening in the library today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {cards.map((card) => (
            <div key={card.label} className={`${card.color} text-white rounded-2xl p-6 shadow-md`}>
              <div className="text-3xl mb-2">{card.icon}</div>
              <p className="text-sm opacity-80 font-medium">{card.label}</p>
              <p className="text-4xl font-bold mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Recent Reservations</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Member</th>
                <th className="px-6 py-3 text-left">Book</th>
                <th className="px-6 py-3 text-left">Due Date</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentReservations.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium">{r.member_name}</td>
                  <td className="px-6 py-3 text-slate-600">{r.book_title}</td>
                  <td className="px-6 py-3 text-slate-600">{r.due_date?.split('T')[0]}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentReservations.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                    No reservations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;