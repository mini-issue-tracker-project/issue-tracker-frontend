"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Comment, Issue, Tag } from "@/lib/types"
import AddIssueForm from './AddIssueForm'
import { IssueFilters } from "./IssueFilters"
import { Filter } from "lucide-react"
import Link from "next/link"
import { fetchWithAuth } from "@/app/utils/api";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation"

const PAGE_SIZE = 5;

export function IssueList() {
  const { user, role } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Helper to get query params as object
  const getQuery = () => {
    const obj: Record<string, string> = {};
    searchParams.forEach((v, k) => { obj[k] = v; });
    return obj;
  };
  const query = getQuery();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [form, setForm] = useState<{
    title: string;
    author: { id: number; name: string } | null;
    priority: string;
    status: string;
    tags: { id: number; name: string }[];
    comments: Comment[];
  }>({
    title: "",
    author: null,
    priority: "",
    status: "",
    tags: [],
    comments: [],
  });
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [statuses, setStatuses] = useState<{ id: number; name: string }[]>([])
  const [priorities, setPriorities] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    fetchWithAuth('/api/statuses')
      .then(r => r.json())
      .then(setStatuses)
      .catch(e => console.error('Error fetching statuses:', e))
  
    fetchWithAuth('/api/priorities')
      .then(r => r.json())
      .then(setPriorities)
      .catch(e => console.error('Error fetching priorities:', e))
  }, [])


  // Helper to reload issues
  const loadIssues = () => {
    const skipQ = typeof query.skip === 'string' ? parseInt(query.skip) : 0;
    const limitQ = typeof query.limit === 'string' ? parseInt(query.limit) : PAGE_SIZE;
    const params = new URLSearchParams({
      ...Object.fromEntries(Object.entries(query).filter(([k, v]) => v !== undefined)),
      skip: String(isNaN(skipQ) ? 0 : skipQ),
      limit: String(isNaN(limitQ) ? PAGE_SIZE : limitQ),
    });
    fetchWithAuth(`/api/issues?${params}`)
      .then(res => res.json())
      .then(res => {
        setIssues(res.data);
        setTotalCount(res.total_count);
        setSkip(res.skip);
        setLimit(res.limit);
      })
      .catch(error => console.error('Error fetching issues:', error));
  };

  // Fetch issues when query changes
  useEffect(() => {
    loadIssues();
  }, [searchParams]);

  useEffect(() => {
    fetchWithAuth('/api/tags')
      .then(r => r.json())
      .then(setAvailableTags)
      .catch(e => console.error('Error fetching tags:', e))
  }, [])
  

  const handleEdit = (issue: Issue) => {
    setEditingId(issue.id)
    setForm({
      title: issue.title,
      author: issue.author,
      priority: issue.priority?.name || "",
      status: issue.status?.name || "",
      tags: issue.tags.map((tag: { id: number; name: string }) => tag),
      comments: issue.comments,
    })    
  }

  const handleUpdate = async () => {
    if (editingId === null) return
    setEditError(null)

    // 1. Check for login token
    const token = localStorage.getItem("access_token")
    if (!token) {
      setEditError("You must log in before editing an issue.")
      return
    }

    // 2. Prepare payload
    const payload: any = {
      title: form.title,
      tags: form.tags.map(t => t.id),
    };
    const statusObj = statuses.find(s => s.name === form.status);
    if (statusObj) payload.status_id = statusObj.id;
    const priorityObj = priorities.find(p => p.name === form.priority);
    if (priorityObj) payload.priority_id = priorityObj.id;
    
    // 3. Send PUT with Bearer token
    try {
      const response = await fetchWithAuth(`/api/issues/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update issue');
      }
      // 4. Refetch current page and exit edit mode
      loadIssues();
      setEditingId(null);
    } catch (err: any) {
      setEditError(err.message);
    }
  }

  const handleDelete = (id: number) => {
    const confirmed = confirm("Are you sure you want to delete this issue?");
    if (confirmed) {
      fetchWithAuth(`/api/issues/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          loadIssues();
        })
        .catch(error => console.error('Error deleting issue:', error));
    }
  };

  const handleAdd = (newIssue: Issue) => {
    setShowAddForm(false);
    loadIssues();
  };

  // For router.push, use router.push(url) with a string
  const updateQuery = (newQuery: Record<string, any>) => {
    const params = new URLSearchParams({ ...query, ...newQuery });
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex justify-between items-center mb-4">
        {user && (
          <Button onClick={() => setShowAddForm(prev => !prev)}>
            {showAddForm ? "Cancel" : "Add New Issue"}
          </Button>
        )}
        {/* Filter button with icon */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(prev => !prev)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {showAddForm && user && <AddIssueForm onAdd={handleAdd} />}

      {/* Filter UI */}
      {showFilters && (
        <div className="mb-4">
          <IssueFilters onFilterApply={() => setShowFilters(false)} />
        </div>
      )}

      {/* Issues list */}
      {issues.map((issue) => (
        <div key={issue.id} className="border p-4 rounded shadow">
          {editingId === issue.id ? (
            <div className="space-y-2">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border px-3 py-1 rounded"
                placeholder="Title"
              />
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                className="w-full border px-3 py-1 rounded"
              >
                {priorities.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full border px-3 py-1 rounded"
              >
                {statuses.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <div className="flex gap-2 flex-wrap">
                {availableTags.map(tag => {
                  const selected = form.tags.some(t => t.id === tag.id);
                  return (
                    <Button
                      key={tag.id}
                      size="sm"
                      style={{
                        backgroundColor: tag.color || (selected ? '#333' : '#eee'),
                        color: '#fff',
                        opacity: selected ? 1 : 0.4,
                        border: selected ? '2px solid #222' : '1px solid #ccc',
                      }}
                      onClick={() =>
                        setForm(prev => ({
                          ...prev,
                          tags: selected
                            ? prev.tags.filter(t => t.id !== tag.id)
                            : [...prev.tags, tag],
                        }))
                      }
                    >
                      {tag.name}
                    </Button>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdate}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
              {editError && <p className="text-red-500 mt-2">{editError}</p>}
            </div>
          ) : (
            <>
              <Link href={`/issues/${issue.id}`}>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-lg cursor-pointer hover:underline">{issue.title}</h3>
                  <span className="text-sm text-gray-500">{issue.comment_count} comments</span>
                </div>
              </Link>
              <p className="text-sm text-gray-500">
                Author: {issue.author?.name || ""} | Status: {issue.status?.name} | Priority: {issue.priority?.name}
              </p>
              {issue.tags && issue.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2 text-sm">
                  {issue.tags.map((tag: Tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ backgroundColor: tag.color || '#e0e0e0', color: '#000' }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                {(role === 'admin' || (user && user.id === issue.author?.id)) && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(issue)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(issue.id)}>Delete</Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ))}

      {/* Pagination */}
      <div className="flex gap-2 mt-4">
        <Button
          disabled={skip === 0}
          onClick={() => updateQuery({ skip: Math.max(0, skip - limit), limit: PAGE_SIZE })}
        >
          Prev
        </Button>
        <Button
          disabled={skip + issues.length >= totalCount}
          onClick={() => updateQuery({ skip: skip + limit, limit: PAGE_SIZE })}
        >
          Next
        </Button>
        <span className="ml-2 text-sm text-gray-500">{skip + 1} - {Math.min(skip + issues.length, totalCount)} of {totalCount}</span>
      </div>
    </div>
  )
}
