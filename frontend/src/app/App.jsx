import "./App.css"
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect } from "react"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"

function App() {
  const editorRef = useRef(null)
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })
  const [users, setUsers] = useState([])
  const [draftUsername, setDraftUsername] = useState("")
  const [editorReady, setEditorReady] = useState(false)

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])

  const handleMount = (editor) => {
    editorRef.current = editor
    setEditorReady(true)
  }

  useEffect(() => {
    if (!username || !editorReady || !editorRef.current) {
      if (!username) {
        setUsers([])
      }
      return
    }

    const provider = new SocketIOProvider("/", "monaco-room", ydoc, {
      autoConnect: true,
    })

    const updateUsers = () => {
      const nextUsers = Array.from(provider.awareness.getStates().values())
        .map((state) => state?.user)
        .filter(Boolean)

      setUsers(nextUsers)
    }

    const monacoBinding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    )

    provider.awareness.setLocalStateField("user", { username })
    provider.awareness.on("change", updateUsers)
    updateUsers()

    return () => {
      monacoBinding.destroy()
      provider.awareness.setLocalStateField("user", null)
      provider.disconnect()
    }
  }, [username, editorReady, ydoc, yText])

  const handleUsernameSubmit = (e) => {
    e.preventDefault()

    const nextUsername = draftUsername.trim()
    if (!nextUsername) return

    setUsername(nextUsername)
    window.history.pushState({}, "", `?username=${nextUsername}`)
  }

  if (!username) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col gap-4">
          <form onSubmit={handleUsernameSubmit}>
            <input
              type="text"
              placeholder="Enter your username"
              value={draftUsername}
              onChange={(e) => setDraftUsername(e.target.value)}
              name="username"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Join
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg">
        <h2 className="text-lg font-semibold p-4 border-b border-gray-300">Users</h2>
        <ul className="p-4">
          {users.map((user, index) => (
            <li key={`${user.username}-${index}`} className="mb-2">
              {user.username}
            </li>
          ))}
        </ul>
      </aside>
      <section className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          language="javascript"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  )
}

export default App
