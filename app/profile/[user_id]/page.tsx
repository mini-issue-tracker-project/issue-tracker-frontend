"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import { Button, Input, Label } from "../../../components/ui";
import AdminManagement from "../../../components/custom/admin/AdminManagement";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  stats: {
    total_issues: number;
    filtered_issues_count: number;
    total_comments: number;
  };
  my_issues: Array<{
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    status: { id: number; name: string } | null;
    priority: { id: number; name: string } | null;
  }>;
  my_comments: Array<{
    id: number;
    content: string;
    updated_at: string;
    issue: { id: number; title: string } | null;
  }>;
}

interface Status {
  id: number;
  name: string;
}

interface PaginatedData {
  data: any[];
  total_count: number;
  skip: number;
  limit: number;
}

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.user_id as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: ""
  });
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Status filter state
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);

  // Pagination state for issues and comments
  const [issuesData, setIssuesData] = useState<PaginatedData>({
    data: [],
    total_count: 0,
    skip: 0,
    limit: 5
  });
  const [commentsData, setCommentsData] = useState<PaginatedData>({
    data: [],
    total_count: 0,
    skip: 0,
    limit: 5
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !token) {
      router.push("/");
      return;
    }
  }, [user, token, router]);

  // Fetch statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetchWithAuth('/api/statuses');
        if (response.ok) {
          const data = await response.json();
          setStatuses(data);
          // Set default to first status (usually "open")
          if (data.length > 0) {
            setSelectedStatusId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching statuses:', err);
      }
    };

    fetchStatuses();
  }, []);

  // Fetch profile data
  useEffect(() => {
    if (!user || !token || !userId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Add status_id to query if selected
        const params = selectedStatusId ? `?status_id=${selectedStatusId}` : '';
        const response = await fetchWithAuth(`/api/users/${userId}${params}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch profile: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        setProfile(data);
        setFormData(prev => ({ ...prev, name: data.name }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, token, userId, selectedStatusId]);

  // Fetch paginated issues
  const fetchIssues = async (skip: number = 0, limit: number = 5) => {
    if (!user || !token || !userId) return;

    try {
      const params = new URLSearchParams({
        skip: String(skip),
        limit: String(limit),
        author_id: userId
      });

      const response = await fetchWithAuth(`/api/issues?${params}`);
      if (response.ok) {
        const data = await response.json();
        setIssuesData({
          data: data.data,
          total_count: data.total_count,
          skip: data.skip,
          limit: data.limit
        });
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  };

  // Fetch paginated comments
  const fetchComments = async (skip: number = 0, limit: number = 5) => {
    if (!user || !token || !userId) return;

    try {
      const params = new URLSearchParams({
        skip: String(skip),
        limit: String(limit),
        author_id: userId
      });

      const response = await fetchWithAuth(`/api/comments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCommentsData({
          data: data.data,
          total_count: data.total_count,
          skip: data.skip,
          limit: data.limit
        });
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // Load initial data
  useEffect(() => {
    if (profile) {
      fetchIssues();
      fetchComments();
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user || !token) return;

    // Validate password confirmation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setUpdateError("Passwords don't match");
      return;
    }

    try {
      setUpdateError(null);
      setUpdateSuccess(false);

      const updateData: any = {};
      if (formData.name !== profile?.name) {
        updateData.name = formData.name;
      }
      if (formData.password) {
        updateData.password = formData.password;
      }

      if (Object.keys(updateData).length === 0) {
        setEditingProfile(false);
        return;
      }

      const response = await fetchWithAuth(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setProfile(prev => prev ? { ...prev, ...updatedUser } : null);
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      setUpdateSuccess(true);
      setEditingProfile(false);

      // Update auth context with new name if it's the current user
      if (parseInt(userId) === user.id) {
        updateUser({ name: updatedUser.name });
      }
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateIssuesQuery = (newParams: { skip?: number; limit?: number }) => {
    const newSkip = newParams.skip !== undefined ? newParams.skip : issuesData.skip;
    const newLimit = newParams.limit !== undefined ? newParams.limit : issuesData.limit;
    fetchIssues(newSkip, newLimit);
  };

  const updateCommentsQuery = (newParams: { skip?: number; limit?: number }) => {
    const newSkip = newParams.skip !== undefined ? newParams.skip : commentsData.skip;
    const newLimit = newParams.limit !== undefined ? newParams.limit : commentsData.limit;
    fetchComments(newSkip, newLimit);
  };

  if (!user || !token) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Issues
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Profile - {profile.name}</h1>

      {/* Stats Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Statistics</h2>
        
        {/* Status Filter */}
        <div className="mb-4">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status:
          </label>
          <select
            id="status-filter"
            value={selectedStatusId || ''}
            onChange={(e) => setSelectedStatusId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{profile.stats.total_issues}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{profile.stats.filtered_issues_count}</div>
            <div className="text-sm text-gray-600">
              {selectedStatusId 
                ? `${statuses.find(s => s.id === selectedStatusId)?.name || 'Filtered'} Issues`
                : 'Open Issues'
              }
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{profile.stats.total_comments}</div>
            <div className="text-sm text-gray-600">Total Comments</div>
          </div>
        </div>
      </div>

      {/* My Issues List - Full Width */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">My Issues</h2>
        {issuesData.data.length === 0 ? (
          <p className="text-gray-500">No issues found.</p>
        ) : (
          <div className="space-y-3">
            {issuesData.data.map((issue) => (
              <div key={issue.id} className="border-b border-gray-200 pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <a 
                      href={`/issues/${issue.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {issue.title}
                    </a>
                    <div className="text-sm text-gray-500 mt-1">
                      Created: {new Date(issue.created_at).toLocaleDateString()}
                      <span className="ml-2">
                        Updated: {new Date(issue.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="inline-block px-2 py-1 bg-gray-100 rounded text-gray-700 mr-2">
                      {issue.status?.name || 'No status'}
                    </div>
                    <div className="inline-block px-2 py-1 bg-gray-100 rounded text-gray-700">
                      {issue.priority?.name || 'No priority'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Issues Pagination */}
        {issuesData.total_count > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {issuesData.skip + 1} to {Math.min(issuesData.skip + issuesData.limit, issuesData.total_count)} of {issuesData.total_count} issues
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateIssuesQuery({ skip: Math.max(0, issuesData.skip - issuesData.limit) })}
                disabled={issuesData.skip === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateIssuesQuery({ skip: issuesData.skip + issuesData.limit })}
                disabled={issuesData.skip + issuesData.limit >= issuesData.total_count}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* My Comments List - Full Width */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">My Comments</h2>
        {commentsData.data.length === 0 ? (
          <p className="text-gray-500">No comments found.</p>
        ) : (
          <div className="space-y-3">
            {commentsData.data.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-3">
                <div className="text-sm text-gray-600 mb-1">
                  {comment.issue && (
                    <a 
                      href={`/issues/${comment.issue.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {comment.issue.title}
                    </a>
                  )}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  Last updated: {new Date(comment.updated_at).toLocaleDateString()}
                </div>
                <div className="text-gray-700">
                  {comment.content.length > 100 
                    ? `${comment.content.substring(0, 100)}...` 
                    : comment.content
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comments Pagination */}
        {commentsData.total_count > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {commentsData.skip + 1} to {Math.min(commentsData.skip + commentsData.limit, commentsData.total_count)} of {commentsData.total_count} comments
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateCommentsQuery({ skip: Math.max(0, commentsData.skip - commentsData.limit) })}
                disabled={commentsData.skip === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateCommentsQuery({ skip: commentsData.skip + commentsData.limit })}
                disabled={commentsData.skip + commentsData.limit >= commentsData.total_count}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Info Form - Only show if viewing own profile */}
      {parseInt(userId) === user.id && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Profile Settings</h2>
            {!editingProfile && (
              <Button
                onClick={() => setEditingProfile(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit Profile
              </Button>
            )}
          </div>

          {editingProfile ? (
            <div className="space-y-4">
              {updateError && (
                <div className="text-red-600 bg-red-50 p-3 rounded">
                  {updateError}
                </div>
              )}
              {updateSuccess && (
                <div className="text-green-600 bg-green-50 p-3 rounded">
                  Profile updated successfully!
                </div>
              )}
              
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="mt-1 bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setEditingProfile(false);
                    setFormData(prev => ({ ...prev, name: profile.name, password: "", confirmPassword: "" }));
                    setUpdateError(null);
                    setUpdateSuccess(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {profile.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {profile.email}
              </div>
              <div>
                <span className="font-medium">Role:</span> {profile.role}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Management Section - Only show for admin users */}
      {user.role === 'admin' && (
        <div className="mt-8">
          <AdminManagement isAdmin={user.role === 'admin'} />
        </div>
      )}
    </div>
  );
} 