import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [complaintsResponse, statsResponse] = await Promise.all([
        api.get('/complaints'),
        user?.role === 'admin' ? api.get('/admin/dashboard') : Promise.resolve(null)
      ]);

      setRecentComplaints(complaintsResponse.data.slice(0, 5));
      
      if (user?.role === 'admin' && statsResponse) {
        setStats(statsResponse.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Welcome, {user?.name}!</h2>
      
      {user?.role === 'admin' && stats && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalComplaints}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.pendingComplaints}</div>
            <div className="stat-label">Pending Complaints</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.resolvedComplaints}</div>
            <div className="stat-label">Resolved Complaints</div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Complaints</h5>
              <Link to="/complaints" className="btn btn-primary btn-sm">
                View All
              </Link>
            </div>
            <div className="card-body">
              {recentComplaints.length === 0 ? (
                <p className="text-muted">No complaints found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentComplaints.map((complaint) => (
                        <tr key={complaint._id}>
                          <td>{complaint.title}</td>
                          <td>
                            <span className={`badge status-${complaint.status}`}>
                              {complaint.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge priority-${complaint.priority}`}>
                              {complaint.priority}
                            </span>
                          </td>
                          <td>
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <Link 
                              to={`/complaints/${complaint._id}`}
                              className="btn btn-outline-primary btn-sm"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              {user?.role === 'customer' && (
                <Link to="/complaints/new" className="btn btn-primary w-100 mb-2">
                  Create New Complaint
                </Link>
              )}
              
              <Link to="/complaints" className="btn btn-outline-primary w-100 mb-2">
                View Complaints
              </Link>
              
              <Link to="/profile" className="btn btn-outline-secondary w-100 mb-2">
                Update Profile
              </Link>
              
              {user?.role === 'admin' && (
                <Link to="/admin" className="btn btn-outline-danger w-100">
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
          
          <div className="card mt-3">
            <div className="card-header">
              <h5 className="mb-0">User Info</h5>
            </div>
            <div className="card-body">
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              {user?.phone && <p><strong>Phone:</strong> {user.phone}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 