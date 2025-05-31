"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Undo, Info, Edit, Eye, EyeOff, Palette, ChevronDown, ChevronUp } from "lucide-react"
import NoteEditor from "./note-editor"
import AudioRecorder from "./audio-recorder"

interface ItemData {
  number: number
  day: string
  completed: boolean
  completedTime?: string
  note?: string
  images?: string[]
  color?: string
  hidden?: boolean
  audioNotes?: any[]
}

interface ItemCardProps {
  item: ItemData
  mode: "hizb" | "juz"
  onUpdate: (updatedItem: ItemData) => void
  onShowDetails: (item: ItemData) => void
}

export default function ItemCard({ item, mode, onUpdate, onShowDetails }: ItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleComplete = () => {
    const updatedItem = {
      ...item,
      completed: true,
      completedTime: new Date().toLocaleString(),
    }
    onUpdate(updatedItem)
  }

  const handleUndo = () => {
    const updatedItem = {
      ...item,
      completed: false,
      completedTime: undefined,
    }
    onUpdate(updatedItem)
  }

  const handleToggleVisibility = () => {
    const updatedItem = {
      ...item,
      hidden: !item.hidden,
    }
    onUpdate(updatedItem)
  }

  const handleColorChange = (color: string) => {
    const updatedItem = {
      ...item,
      color,
    }
    onUpdate(updatedItem)
    setShowColorPicker(false)
  }

  const handleSaveNote = (note: string, images: string[]) => {
    const updatedItem = {
      ...item,
      note: note.trim() || undefined,
      images,
    }
    onUpdate(updatedItem)
    setIsEditingNote(false)
  }

  const handleSaveAudio = (audioNote: any) => {
    const updatedItem = {
      ...item,
      audioNotes: [...(item.audioNotes || []), audioNote],
    }
    onUpdate(updatedItem)
  }

  const handleDeleteAudio = (index: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الملاحظة الصوتية؟")) {
      const updatedItem = {
        ...item,
        audioNotes: item.audioNotes?.filter((_, i) => i !== index) || [],
      }
      onUpdate(updatedItem)
    }
  }

  const handleEditAudio = (index: number, newTitle: string) => {
    const updatedItem = {
      ...item,
      audioNotes: item.audioNotes?.map((note, i) => (i === index ? { ...note, title: newTitle } : note)) || [],
    }
    onUpdate(updatedItem)
  }

  if (item.hidden) {
    return null
  }

  return (
    <Card
      className="w-full transition-all duration-200 hover:shadow-xl bg-slate-800 border-slate-600"
      style={{ backgroundColor: item.color && item.color !== "#1e1e2f" ? item.color : undefined }}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-semibold text-white">
              {mode === "hizb" ? "حزب" : "جزء"} {item.number}
            </h3>
            <Badge variant="secondary" className="bg-slate-700 text-slate-200">
              {item.day}
            </Badge>
            {item.completed && (
              <Badge variant="default" className="bg-emerald-600 text-white">
                مكتمل
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:text-emerald-400"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleVisibility}
              className="text-white hover:text-emerald-400"
            >
              {item.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={item.completed ? handleUndo : handleComplete}
              variant={item.completed ? "outline" : "default"}
              size="sm"
              className={`flex items-center gap-1 ${
                item.completed
                  ? "border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {item.completed ? (
                <>
                  <Undo className="h-4 w-4" />
                  تراجع
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  إنهاء
                </>
              )}
            </Button>

            <Button
              onClick={() => onShowDetails(item)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white bg-slate-800"
            >
              <Info className="h-4 w-4" />
              تفاصيل
            </Button>

            <Button
              onClick={() => setIsEditingNote(!isEditingNote)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white bg-slate-800"
            >
              <Edit className="h-4 w-4" />
              {item.note ? "تعديل الملاحظة" : "إضافة ملاحظة"}
            </Button>

            <div className="relative">
              <Button
                onClick={() => setShowColorPicker(!showColorPicker)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white bg-slate-800"
              >
                <Palette className="h-4 w-4" />
                اللون
              </Button>

              {showColorPicker && (
                <div className="absolute top-full mt-1 z-10 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      "#1e1e2f",
                      "#dc2626",
                      "#16a34a",
                      "#2563eb",
                      "#d97706",
                      "#7c3aed",
                      "#db2777",
                      "#0891b2",
                      "#65a30d",
                      "#ea580c",
                      "#4f46e5",
                      "#059669",
                    ].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded border-2 border-slate-500 hover:border-slate-300 transition-colors"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Completion Info */}
          {item.completed && item.completedTime && (
            <div className="text-sm text-emerald-300 bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg">
              تم الانتهاء: {item.completedTime}
            </div>
          )}

          {/* Note Section */}
          {isEditingNote ? (
            <NoteEditor
              note={item.note || ""}
              images={item.images || []}
              onSave={handleSaveNote}
              onCancel={() => setIsEditingNote(false)}
            />
          ) : (
            item.note && (
              <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-white">الملاحظة:</h4>
                <p className="text-sm whitespace-pre-wrap text-slate-200">{item.note}</p>

                {item.images && item.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                    {item.images.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 border border-slate-500"
                        onClick={() => {
                          const modal = document.createElement("div")
                          modal.className =
                            "fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                          modal.innerHTML = `
                          <div class="relative max-w-4xl max-h-4xl">
                            <img src="${image}" alt="صورة مكبرة" class="max-w-full max-h-full object-contain rounded-lg" />
                            <button class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded px-3 py-1 font-bold">×</button>
                          </div>
                        `
                          modal.onclick = () => modal.remove()
                          document.body.appendChild(modal)
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {/* Audio Recorder */}
          <AudioRecorder
            audioNotes={item.audioNotes || []}
            onSaveAudio={handleSaveAudio}
            onDeleteAudio={handleDeleteAudio}
            onEditAudio={handleEditAudio}
          />
        </CardContent>
      )}
    </Card>
  )
}
