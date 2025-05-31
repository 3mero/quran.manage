"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Square, Play, Pause, Edit, Trash2 } from "lucide-react"

interface AudioNote {
  url: string
  title: string
  timestamp: string
}

interface AudioRecorderProps {
  audioNotes: AudioNote[]
  onSaveAudio: (audioNote: AudioNote) => void
  onDeleteAudio: (index: number) => void
  onEditAudio: (index: number, newTitle: string) => void
}

export default function AudioRecorder({ audioNotes, onSaveAudio, onDeleteAudio, onEditAudio }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null)
  const [audioTitle, setAudioTitle] = useState("")
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setRecordedAudio(audioUrl)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("خطأ في الوصول للميكروفون:", err)
      alert("لا يمكن الوصول للميكروفون")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const saveRecording = () => {
    if (recordedAudio && audioTitle.trim()) {
      const audioNote: AudioNote = {
        url: recordedAudio,
        title: audioTitle.trim(),
        timestamp: new Date().toLocaleString(),
      }
      onSaveAudio(audioNote)
      setRecordedAudio(null)
      setAudioTitle("")
    } else {
      alert("يرجى إدخال عنوان للتسجيل")
    }
  }

  const playAudio = (index: number) => {
    const audio = audioRefs.current[index]
    if (audio) {
      if (playingIndex === index) {
        audio.pause()
        setPlayingIndex(null)
      } else {
        // إيقاف أي تسجيل آخر يتم تشغيله
        audioRefs.current.forEach((a, i) => {
          if (a && i !== index) {
            a.pause()
          }
        })
        audio.play()
        setPlayingIndex(index)
      }
    }
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditTitle(audioNotes[index].title)
  }

  const saveEdit = () => {
    if (editingIndex !== null && editTitle.trim()) {
      onEditAudio(editingIndex, editTitle.trim())
      setEditingIndex(null)
      setEditTitle("")
    }
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditTitle("")
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-semibold">الملاحظات الصوتية</h4>

      {/* Recording Controls */}
      <div className="space-y-2">
        {!isRecording && !recordedAudio && (
          <Button onClick={startRecording} className="w-full flex items-center gap-2" variant="outline">
            <Mic className="h-4 w-4" />
            بدء التسجيل
          </Button>
        )}

        {isRecording && (
          <Button onClick={stopRecording} className="w-full flex items-center gap-2" variant="destructive">
            <Square className="h-4 w-4" />
            إيقاف التسجيل
          </Button>
        )}

        {recordedAudio && (
          <div className="space-y-2">
            <audio src={recordedAudio} controls className="w-full" />
            <Input placeholder="عنوان التسجيل" value={audioTitle} onChange={(e) => setAudioTitle(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={saveRecording} className="flex-1">
                حفظ التسجيل
              </Button>
              <Button onClick={() => setRecordedAudio(null)} variant="outline" className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Audio Notes List */}
      {audioNotes.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium">التسجيلات المحفوظة:</h5>
          {audioNotes.map((note, index) => (
            <div key={index} className="border rounded p-3 space-y-2">
              {editingIndex === index ? (
                <div className="space-y-2">
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="عنوان التسجيل" />
                  <div className="flex gap-2">
                    <Button onClick={saveEdit} size="sm" className="flex-1">
                      حفظ
                    </Button>
                    <Button onClick={cancelEdit} size="sm" variant="outline" className="flex-1">
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{note.title}</div>
                      <div className="text-sm text-muted-foreground">{note.timestamp}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button onClick={() => handleEdit(index)} size="sm" variant="ghost">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => onDeleteAudio(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => playAudio(index)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {playingIndex === index ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      {playingIndex === index ? "إيقاف" : "تشغيل"}
                    </Button>
                    <audio
                      ref={(el) => (audioRefs.current[index] = el)}
                      src={note.url}
                      onEnded={() => setPlayingIndex(null)}
                      className="hidden"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
