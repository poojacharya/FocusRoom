import { useEffect, useRef, useState } from 'react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Trash2,
  Underline,
  Upload,
} from 'lucide-react'
import { useAutosaveNote } from '../../hooks/useAutosaveNote'
import { SaveStatusIndicator } from './SaveStatusIndicator'
import { readAttachments, showAttachmentError } from '../../lib/attachments'
import { showErrorToast } from '../../lib/toast'

const ALLOWED_TAGS = new Set(['A', 'B', 'BR', 'DIV', 'EM', 'H1', 'H2', 'H3', 'I', 'IMG', 'LI', 'OL', 'P', 'STRONG', 'U', 'UL'])
const ALLOWED_ALIGNMENTS = new Set(['left', 'center', 'right', 'justify'])
const MAX_NOTE_EMBEDDED_BYTES = 7 * 1024 * 1024

function safeImageSource(src) {
  if (/^data:image\/(png|jpeg|gif|webp|avif|bmp);base64,/i.test(src)) return true
  try {
    return ['http:', 'https:'].includes(new URL(src).protocol)
  } catch {
    return false
  }
}

function isSafeLink(href) {
  try {
    const protocol = new URL(href, 'https://focusroom.local').protocol
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)
  } catch {
    return false
  }
}

function sanitizeEditorHtml(html) {
  if (typeof DOMParser === 'undefined') return html

  const document = new DOMParser().parseFromString(html, 'text/html')
  const sanitizeElement = (element) => {
    Array.from(element.children).forEach(sanitizeElement)

    if (!ALLOWED_TAGS.has(element.tagName)) {
      element.replaceWith(...element.childNodes)
      return
    }

    const href = element.getAttribute('href')
    const src = element.getAttribute('src')
    const alt = element.getAttribute('alt')
    const textAlign = (element.style.textAlign || element.getAttribute('align') || '').toLowerCase()
    Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name))

    if (element.tagName === 'A' && href && isSafeLink(href)) {
      element.setAttribute('href', href)
      element.setAttribute('rel', 'noreferrer')
    }
    if (element.tagName === 'IMG' && src && safeImageSource(src)) {
      element.setAttribute('src', src)
      element.setAttribute('alt', alt || 'Pasted image')
      element.setAttribute('class', 'my-3 max-h-96 max-w-full rounded-lg object-contain')
      element.setAttribute('loading', 'lazy')
    }
    if (ALLOWED_ALIGNMENTS.has(textAlign)) element.style.textAlign = textAlign
  }

  Array.from(document.body.children).forEach(sanitizeElement)
  return document.body.innerHTML
}

function toEditorHtml(body) {
  if (!body) return ''
  if (/<\/?[a-z][^>]*>/i.test(body)) return sanitizeEditorHtml(body)
  return body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
}

function ToolbarButton({ label, onClick, children, disabled = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-wait disabled:opacity-60 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100"
    >
      {children}
    </button>
  )
}

export function NoteEditor({ note, onDelete, isDeleting }) {
  const { title, setTitle, body, setBody, documents, setDocuments, status, retry } = useAutosaveNote(note)
  const titleRef = useRef(null)
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const savedRangeRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  // Auto-focus the title on a brand-new (empty-title) note so typing works
  // immediately. Switching to an existing note doesn't steal focus — the
  // person may just be browsing, not about to retitle it.
  useEffect(() => {
    if (note && !note.title) {
      titleRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?._id])

  // ContentEditable is intentionally unmanaged by React while typing so
  // formatting commands keep the selection/caret in place. It is synced
  // when switching notes or when the editor is not active.
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || document.activeElement === editor) return
    const nextHtml = toEditorHtml(body)
    if (editor.innerHTML !== nextHtml) editor.innerHTML = nextHtml
  }, [body, note?._id])

  const updateBodyFromEditor = () => {
    const editor = editorRef.current
    if (!editor) return
    const nextBody = sanitizeEditorHtml(editor.innerHTML)
    if (editor.innerHTML !== nextBody) editor.innerHTML = nextBody
    setBody(nextBody)
  }

  const applyCommand = (command, value = null) => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    document.execCommand(command, false, value)
    updateBodyFromEditor()
  }

  const addLink = () => {
    const url = window.prompt('Enter a link URL')?.trim()
    if (!url || !isSafeLink(url)) return
    applyCommand('createLink', url)
  }

  const addDocument = () => {
    const selection = window.getSelection()
    savedRangeRef.current = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null
    fileInputRef.current?.click()
  }

  const insertImages = (images, savedRange) => {
    const editor = editorRef.current
    if (!editor) return

    editor.focus()
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      if (savedRange && editor.contains(savedRange.commonAncestorContainer)) {
        selection.addRange(savedRange)
      }
    }

    for (const image of images) {
      const img = document.createElement('img')
      img.src = image.data
      img.alt = image.name
      img.className = 'my-3 max-h-96 max-w-full rounded-lg object-contain'
      img.loading = 'lazy'
      const activeRange = selection?.rangeCount ? selection.getRangeAt(0) : null
      if (activeRange && editor.contains(activeRange.commonAncestorContainer)) {
        activeRange.deleteContents()
        activeRange.insertNode(img)
        activeRange.setStartAfter(img)
        activeRange.collapse(true)
        selection?.removeAllRanges()
        selection?.addRange(activeRange)
      } else {
        editor.append(img)
      }
    }
    updateBodyFromEditor()
  }

  const attachUploadedFiles = async (files, savedRange = null) => {
    setIsUploading(true)
    try {
      const uploadedFiles = await readAttachments(files)
      const images = uploadedFiles.filter((file) => file.type.startsWith('image/'))
      const uploadedDocuments = uploadedFiles
        .filter((file) => !file.type.startsWith('image/'))
        .map((file) => ({
          title: file.name,
          url: file.data,
          type: file.type,
          createdAt: new Date().toISOString(),
        }))

      const existingBodySize = editorRef.current?.innerHTML.length || 0
      const existingDocumentsSize = documents.reduce((total, item) => total + (item.url?.length || 0), 0)
      const newAttachmentsSize = uploadedFiles.reduce((total, file) => total + file.data.length, 0)
      if (existingBodySize + existingDocumentsSize + newAttachmentsSize > MAX_NOTE_EMBEDDED_BYTES) {
        throw new Error('All embedded note content must total 7 MB or less')
      }

      if (images.length > 0) {
        insertImages(images, savedRange)
      }
      if (uploadedDocuments.length > 0) {
        setDocuments((current) => [...current, ...uploadedDocuments])
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    try {
      if (files.length) await attachUploadedFiles(files, savedRangeRef.current)
    } catch (error) {
      showErrorToast(showAttachmentError(error))
    } finally {
      savedRangeRef.current = null
      event.target.value = ''
    }
  }

  const handlePaste = async (event) => {
    const clipboard = event.clipboardData
    const clipboardItems = Array.from(clipboard?.items || [])
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter(Boolean)
    const files = [...new Set([...Array.from(clipboard?.files || []), ...clipboardItems])]
    if (files.length === 0) return

    event.preventDefault()
    const selection = window.getSelection()
    const savedRange = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null
    try {
      await attachUploadedFiles(files, savedRange)
    } catch (error) {
      showErrorToast(showAttachmentError(error))
    }
  }

  const removeDocument = (index) => {
    setDocuments((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  if (!note) return null

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-4 dark:border-white/10">
        <SaveStatusIndicator status={status} onRetry={retry} />
        <button
          type="button"
          onClick={() => onDelete(note._id)}
          disabled={isDeleting}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled note"
          className="w-full bg-transparent text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300 dark:text-gray-50 dark:placeholder:text-gray-600"
        />
        <div
          className="mt-4 flex flex-wrap items-center gap-1 rounded-xl border border-gray-100 bg-gray-50/70 p-1 dark:border-white/10 dark:bg-white/5"
          role="toolbar"
          aria-label="Text formatting"
        >
          <ToolbarButton label="Bold" onClick={() => applyCommand('bold')}><Bold className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton label="Italic" onClick={() => applyCommand('italic')}><Italic className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton label="Underline" onClick={() => applyCommand('underline')}><Underline className="h-4 w-4" /></ToolbarButton>
          <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-white/10" />
          <ToolbarButton label="Heading 1" onClick={() => applyCommand('formatBlock', '<h1>')}><Heading1 className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton label="Heading 2" onClick={() => applyCommand('formatBlock', '<h2>')}><Heading2 className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton label="Heading 3" onClick={() => applyCommand('formatBlock', '<h3>')}><Heading3 className="h-4 w-4" /></ToolbarButton>
          <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-white/10" />
          <ToolbarButton label="Bullet list" onClick={() => applyCommand('insertUnorderedList')}><List className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton label="Numbered list" onClick={() => applyCommand('insertOrderedList')}><ListOrdered className="h-4 w-4" /></ToolbarButton>
          <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-white/10" />
          <ToolbarButton label="Align left" onClick={() => applyCommand('justifyLeft')}><AlignLeft className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton label="Align center" onClick={() => applyCommand('justifyCenter')}><AlignCenter className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton label="Align right" onClick={() => applyCommand('justifyRight')}><AlignRight className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton label="Justify text" onClick={() => applyCommand('justifyFull')}><AlignJustify className="h-4 w-4" /></ToolbarButton>
          <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-white/10" />
          <ToolbarButton label="Add link" onClick={addLink}><Link className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton label="Add image or document" onClick={addDocument} disabled={isUploading}>
            <span className="inline-flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="text-xs font-medium">{isUploading ? 'Adding…' : 'Add image or file'}</span>
            </span>
          </ToolbarButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/avif,image/bmp,.png,.jpg,.jpeg,.jfif,.jpe,.gif,.webp,.avif,.bmp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {documents.length > 0 && (
          <div className="mt-4 space-y-3">
            {documents.map((attachment, index) => (
              <div
                key={`${attachment.title}-${attachment.url}-${index}`}
                className="rounded-xl border border-gray-200 p-3 dark:border-white/10"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <a
                    href={attachment.url || undefined}
                    download={attachment.title || 'attachment'}
                    className="truncate text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
                  >
                    {attachment.title || 'Untitled document'}
                  </a>
                  <button
                    type="button"
                    aria-label={`Remove ${attachment.title || 'document'}`}
                    onClick={() => removeDocument(index)}
                    className="shrink-0 text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
                {attachment.type?.startsWith('image/') ? (
                  <img
                    src={attachment.url}
                    alt={attachment.title}
                    className="max-h-96 max-w-full rounded-lg object-contain"
                  />
                ) : attachment.type === 'application/pdf' ? (
                  <iframe
                    src={attachment.url}
                    title={attachment.title}
                    className="h-96 w-full rounded-lg"
                  />
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Embedded attachment · select the filename to download
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          data-placeholder="Start writing."
          onInput={updateBodyFromEditor}
          onPaste={handlePaste}
          className="mt-3 min-h-64 flex-1 whitespace-pre-wrap break-words bg-transparent text-base leading-relaxed text-gray-700 outline-none empty:before:pointer-events-none empty:before:text-gray-300 empty:before:content-[attr(data-placeholder)] dark:text-gray-200 dark:empty:before:text-gray-600 [&_a]:text-brand-600 [&_a]:underline dark:[&_a]:text-brand-400 [&_h1]:my-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:my-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6"
        />
      </div>
    </div>
  )
}
