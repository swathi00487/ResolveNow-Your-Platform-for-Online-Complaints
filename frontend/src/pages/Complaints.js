import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical',
    priority: 'medium'
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    try {
      await api.post('/complaints', formData);
      setShowCreateForm(false);
      setFormData({ title: '', description: '', category: 'technical', priority: 'medium' });
      fetchComplaints();
    } catch (error) {
      console.error('Error creating complaint:', error);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    return complaint.status === filter;
  });

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Complaints</h2>
        {user?.role === 'customer' && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create Complaint'}
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Create New Complaint</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateComplaint}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                      className="form-select"
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="service">Service</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="priority" className="form-label">Priority</label>
                    <select
                      className="form-select"
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary">
                Create Complaint
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">All Complaints</h5>
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filter === 'assigned' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('assigned')}
              >
                Assigned
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filter === 'resolved' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('resolved')}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          {filteredComplaints.length === 0 ? (
            <p className="text-muted">No complaints found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td>{complaint.title}</td>
                      <td>{complaint.category}</td>
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
                          className="btn btn-outline-primary btn-sm me-2"
                        >
                          View
                        </Link>
                        {complaint.status !== 'resolved' && (
                          <Link 
                            to={`/chat/${complaint._id}`}
                            className="btn btn-outline-success btn-sm"
                          >
                            Chat
                          </Link>
                        )}
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
  );
};

export default Complaints; 