"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  stats: {
    total_issues: number;
    closed_issues: number;
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

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const router = useRouter();
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

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !token) {
      router.push("/");
      return;
    }
  }, [user, token, router]);

  // Fetch profile data
  useEffect(() => {
    if (!user || !token) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        const response = await fetchWithAuth(`/api/users/${user.id}`);
        
        
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
  }, [user, token]);

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

      const response = await fetchWithAuth(`/api/users/${user.id}`, {
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

      // Update auth context with new name
      updateUser({ name: updatedUser.name });
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'An error occurred');
    }
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
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      {/* Stats Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{profile.stats.total_issues}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{profile.stats.closed_issues}</div>
            <div className="text-sm text-gray-600">Closed Issues</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{profile.stats.total_comments}</div>
            <div className="text-sm text-gray-600">Total Comments</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Issues List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">My Issues</h2>
          {profile.my_issues.length === 0 ? (
            <p className="text-gray-500">No issues found.</p>
          ) : (
            <div className="space-y-3">
              {profile.my_issues.map((issue) => (
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
                        {issue.updated_at !== issue.created_at && (
                          <span className="ml-2">
                            Updated: {new Date(issue.updated_at).toLocaleDateString()}
                          </span>
                        )}
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
        </div>

        {/* My Comments List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">My Comments</h2>
          {profile.my_comments.length === 0 ? (
            <p className="text-gray-500">No comments found.</p>
          ) : (
            <div className="space-y-3">
              {profile.my_comments.map((comment) => (
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
                    {new Date(comment.updated_at).toLocaleDateString()}
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
        </div>
      </div>

      {/* Profile Info Form */}
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
    </div>
  );
} 