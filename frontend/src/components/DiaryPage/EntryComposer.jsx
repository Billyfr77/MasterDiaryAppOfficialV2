import React, { useState, useRef, useEffect } from "react"
import { FixedSizeList as List } from "react-window"
import { Plus, Save, Trash, Edit } from "lucide-react"

/**
 * EntryComposer - Dark theme entry composer with virtualization
 * Inline editable table with keyboard navigation and optimistic updates
 */
const Row = ({ index, style, data }) => {
  const { entries, onLocalEdit, selected, setSelected, onDelete } = data
  const e = entries[index] || {}
  return (
    <div style={style} className={`grid grid-cols-7 gap-2 items-center p-2 ${index%2===0?'bg-gray-800':'bg-gray-700'} hover:bg-gray-600 transition-colors`}>
      <input aria-label={`date-${index}`} value={e.date||""} onChange={(ev)=>onLocalEdit(index,{...e,date:ev.target.value})} className="col-span-1 bg-gray-900 text-white focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 border border-gray-600" />
      <input aria-label={`project-${index}`} value={e.project||""} onChange={(ev)=>onLocalEdit(index,{...e,project:ev.target.value})} className="col-span-2 bg-gray-900 text-white focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 border border-gray-600" />
      <input aria-label={`hours-${index}`} value={e.totalHours||""} onChange={(ev)=>onLocalEdit(index,{...e,totalHours:ev.target.value})} className="col-span-1 bg-gray-900 text-white focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 border border-gray-600" />
      <input aria-label={`costs-${index}`} value={e.costs||""} onChange={(ev)=>onLocalEdit(index,{...e,costs:ev.target.value})} className="col-span-1 bg-gray-900 text-white focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 border border-gray-600" />
      <button aria-label={`select-${index}`} onClick={()=>setSelected(index)} className={`col-span-1 p-2 rounded ${selected===index?'bg-indigo-600':'bg-gray-600'} hover:bg-indigo-500 transition-colors`}><Save size={16} /></button>
      <button aria-label={`delete-${index}`} onClick={()=>onDelete(e.id)} className="col-span-1 p-2 rounded bg-red-600 hover:bg-red-500 transition-colors"><Trash size={16} /></button>
    </div>
  )
}

const EntryComposer = ({ projects=[], staff=[], entries=[], onCreate, onUpdate, onDelete, loading }) => {
  const [local, setLocal] = useState(entries)
  useEffect(()=> setLocal(entries), [entries])
  const [selected, setSelected] = useState(null)
  const listRef = useRef()

  const onLocalEdit = (index, updated) => {
    setLocal(prev => prev.map((r,i)=> i===index ? updated : r))
  }

  // keyboard shortcuts
  useEffect(()=> {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (selected!=null) {
          onUpdate(local[selected].id, local[selected])
        } else {
          alert("Select a row to save (use Select button)")
        }
      }
      if (e.key === "Enter") {
        // add new blank row at top
        setLocal(prev => [{ date:"", project:"", totalHours:0, costs:0 }, ...prev])
        setTimeout(()=> listRef.current?.scrollToItem(0), 50)
      }
    }
    window.addEventListener("keydown", onKey)
    return ()=> window.removeEventListener("keydown", onKey)
  }, [local, selected, onUpdate])

  const handleAdd = () => {
    setLocal(prev => [{ date:"", project:"", totalHours:0, costs:0 }, ...prev])
    setTimeout(()=> listRef.current?.scrollToItem(0), 50)
  }

  return (
    <section aria-labelledby="composer-heading" className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 id="composer-heading" className="text-lg font-semibold text-white">Entry Composer</h3>
        <div className="flex gap-2">
          <button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded inline-flex items-center gap-2 transition-colors"><Plus /> New (Enter)</button>
          <button onClick={()=>onCreate(local[0])} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded inline-flex items-center gap-2 transition-colors">Quick Save</button>
        </div>
      </div>

      <div className="border border-gray-600 rounded-md overflow-hidden">
        <div className="bg-gray-700 p-2 text-sm grid grid-cols-7 gap-2 font-medium text-gray-300">
          <div>Date</div><div className="col-span-2">Project</div><div>Hours</div><div>Costs</div><div className="col-span-2">Actions</div>
        </div>

        <div style={{height: 420}}>
          <List
            ref={listRef}
            height={420}
            itemCount={local.length}
            itemSize={54}
            width="100%"
            itemData={{ entries: local, onLocalEdit, selected, setSelected, onDelete }}
          >
            {Row}
          </List>
        </div>
      </div>
    </section>
  )
}

export default EntryComposer