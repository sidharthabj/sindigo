'use client'

import { useState, useTransition } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { updateNote } from '@/lib/actions/books'
import type { ShelfStatus } from '@/lib/types'

interface NoteEditorProps {
  shelfEntryId: string
  initialNote: string
  isOwner: boolean
  status: ShelfStatus
}

export function NoteEditor({ shelfEntryId, initialNote, isOwner, status }: NoteEditorProps) {
  const [note, setNote] = useState(initialNote)
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    setError(null)
    startTransition(async () => {
      try {
        await updateNote(shelfEntryId, note)
        setEditing(false)
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  if (!isOwner) {
    return note ? (
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{note}</p>
    ) : (
      <p className="text-sm text-muted-foreground italic">No note yet.</p>
    )
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={5}
          className="resize-none"
          placeholder={
            status === 'wishlist' ? 'Why do you want to read this?' :
            status === 'reading' ? 'How is it going so far?' :
            'What did you think?'
          }
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving…' : 'Save'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setNote(initialNote); setEditing(false); setError(null) }}>Cancel</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {note ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">{note}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic mb-2">No note yet. Click to add one.</p>
      )}
      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
        {note ? 'Edit' : 'Add note'}
      </Button>
    </div>
  )
}
