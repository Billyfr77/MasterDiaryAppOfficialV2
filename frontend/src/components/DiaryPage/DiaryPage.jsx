import React, { useEffect, useState, useCallback, useMemo } from "react"
import { api } from "../../utils/api"
import DiaryKPIBar from "./DiaryKPIBar"
import EntryComposer from "./EntryComposer"
import LedgerPanel from "./LedgerPanel"
import "./diary.css"

/**
 * DiaryPage - Modern, accessible diary management interface
 * Features: Dark theme, responsive design, optimistic updates, role-based access
 */
const DiaryPage = () => {
  const [diaries, setDiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [projects, setProjects] = useState([])
  const [staff, setStaff] = useState([])
  const [userRole, setUserRole] = useState("user")

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [dRes, pRes, sRes, meRes] = await Promise.all([
        api.get("/diaries"),
        api.get("/projects"),
        api.get("/staff"),
        api.get("/auth/me").catch(() => ({ data: { role: "user" } }))
      ])
      setDiaries(dRes.data || [])
      setProjects(pRes.data?.data || pRes.data || [])
      setStaff(sRes.data?.data || sRes.data || [])
      setUserRole(meRes.data?.role || "user")
    } catch (err) {
      console.error("Diary load failed", err)
      setError("Failed to load diary data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleCreateEntry = useCallback(async (entry) => {
    const tempId = `temp-${Date.now()}`
    const optimistic = { ...entry, id: tempId, saving: true }
    setDiaries(prev => [optimistic, ...prev])

    try {
      const res = await api.post("/diaries", entry)
      setDiaries(prev => prev.map(e => e.id === tempId ? res.data : e))
    } catch (err) {
      setDiaries(prev => prev.filter(e => e.id !== tempId))
      setError("Failed to save entry")
      console.error(err)
    }
  }, [])

  const handleUpdateEntry = useCallback(async (id, patch) => {
    setDiaries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))
    try {
      await api.put(`/diaries/${id}`, patch)
    } catch (err) {
      console.error("Update failed", err)
      setError("Failed to update entry")
      fetchAll()
    }
  }, [fetchAll])

  const handleDeleteEntry = useCallback(async (id) => {
    const backup = diaries
    setDiaries(prev => prev.filter(d => d.id !== id))
    try {
      await api.delete(`/diaries/${id}`)
    } catch (err) {
      setDiaries(backup)
      console.error("Delete failed", err)
      setError("Failed to delete entry")
    }
  }, [diaries])

  const memoizedDiaries = useMemo(() => diaries, [diaries])

  return (
    <div className="diary-page min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6" role="main" aria-label="Diary Management Page">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200" role="alert">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 underline hover:no-underline"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}

        <DiaryKPIBar diaries={memoizedDiaries} loading={loading} />

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <EntryComposer
              projects={projects}
              staff={staff}
              onCreate={handleCreateEntry}
              onUpdate={handleUpdateEntry}
              onDelete={handleDeleteEntry}
              entries={memoizedDiaries}
              loading={loading}
            />
          </div>
          <div className="xl:col-span-1">
            <LedgerPanel
              diaries={memoizedDiaries}
              onExportPdf={() => {}}
              userRole={userRole}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiaryPage