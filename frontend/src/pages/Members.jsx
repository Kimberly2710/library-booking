import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.get('/members');
        setMembers(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await API.patch(`/members/${id}/status`, { status });
      setMembers(members.map(m =>
        m.id === id ? { ...m, status } : m
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update.');
    }
  };

  const statusColor = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Members</h2>
        {loading ? (
          <p className="text-gray-500">Loading members...</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Membership</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{member.name}</td>
                    <td className="px-4 py-3 text-gray-600">{member.email}</td>
                    <td className="px-4 py-3 text-gray-600">{member.membership_type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[member.status]}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      {member.status !== 'active' && (
                        <button onClick={() => handleStatus(member.id, 'active')}
                          className="text-green-600 hover:underline text-xs">Activate</button>
                      )}
                      {member.status !== 'suspended' && (
                        <button onClick={() => handleStatus(member.id, 'suspended')}
                          className="text-red-500 hover:underline text-xs">Suspend</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {members.length === 0 && (
              <p className="text-center text-gray-400 py-8">No members found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;