import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const response = await api.get(`/complaints/${id}`);
      setComplaint(response.data);
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await api.patch(`/complaints/${id}/status`, { status, resolution });
      fetchComplaint();
    } catch (error) {
      console.error('Error updating status:', error);
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

  if (!complaint) {
    return <div className="error">Complaint not found</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Complaint Details</h2>
        <Link to="/complaints" className="btn btn-outline-secondary">
          Back to Complaints
        </Link>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">{complaint.title}</h5>
            </div>
            <div className="card-body">
              <p><strong>Description:</strong></p>
              <p>{complaint.description}</p>
              
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Category:</strong> {complaint.category}</p>
                  <p><strong>Priority:</strong> 
                    <span className={`badge priority-${complaint.priority} ms-2`}>
                      {complaint.priority}
                    </span>
                  </p>
                </div>
                <div className="col-md-6">
                  <p><strong>Status:</strong> 
                    <span className={`badge status-${complaint.status} ms-2`}>
                      {complaint.status}
                    </span>
                  </p>
                  <p><strong>Created:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {complaint.assignedAgent && (
                <p><strong>Assigned to:</strong> {complaint.assignedAgent.name}</p>
              )}

              {complaint.resolution && (
                <div className="mt-3">
                  <p><strong>Resolution:</strong></p>
                  <p>{complaint.resolution}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Actions</h5>
            </div>
            <div className="card-body">
              <Link 
                to={`/chat/${complaint._id}`}
                className="btn btn-primary w-100 mb-2"
              >
                Chat
              </Link>

              {(user?.role === 'agent' || user?.role === 'admin') && (
                <div className="mt-3">
                  <h6>Update Status</h6>
                  <select 
                    className="form-select mb-2"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  {status === 'resolved' && (
                    <textarea
                      className="form-control mb-2"
                      placeholder="Resolution details..."
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      rows="3"
                    />
                  )}

                  <button 
                    className="btn btn-success w-100"
                    onClick={handleStatusUpdate}
                  >
                    Update Status
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail; 