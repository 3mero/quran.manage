"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Clipboard, ImageIcon, X } from "lucide-react"

interface NoteEditorProps {
  note: string
  images: string[]
  onSave: (note: string, images: string[]) => void
  onCancel: () => void
}

export default function NoteEditor({ note, images, onSave, onCancel }: NoteEditorProps) {
  const [currentNote, setCurrentNote] = useState(note)
  const [currentImages, setCurrentImages] = useState<string[]>(images || [])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showPasteDialog, setShowPasteDialog] = useState(false)
  const [pasteText, setPasteText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCopy = () => {
    try {
      const textArea = document.createElement("textarea")
      textArea.value = currentNote
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand("copy")
      document.body.removeChild(textArea)

      if (successful) {
        alert("تم نسخ النص بنجاح!")
      } else {
        // محاولة استخدام Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard
            .writeText(currentNote)
            .then(() => {
              alert("تم نسخ النص بنجاح!")
            })
            .catch(() => {
              alert("فشل في نسخ النص")
            })
        } else {
          alert("فشل في نسخ النص")
        }
      }
    } catch (err) {
      console.error("خطأ في النسخ:", err)
      alert("فشل في نسخ النص")
    }
  }

  const handlePaste = async () => {
    try {
      let pastedText = ""

      // محاولة استخدام Clipboard API أولاً
      if (navigator.clipboard && window.isSecureContext) {
        try {
          pastedText = await navigator.clipboard.readText()
        } catch (err) {
          // إذا فشل، استخدم الطريقة البديلة
          pastedText = await fallbackPaste()
        }
      } else {
        // استخدام الطريقة البديلة للمتصفحات القديمة
        pastedText = await fallbackPaste()
      }

      if (pastedText) {
        setCurrentNote((prev) => prev + pastedText)
        alert("تم لصق النص بنجاح!")
      }
    } catch (err) {
      console.error("فشل في لصق النص:", err)
      alert("فشل في لصق النص. يرجى المحاولة مرة أخرى أو استخدام Ctrl+V")
    }
  }

  const fallbackPaste = (): Promise<string> => {
    return new Promise((resolve) => {
      // إنشاء textarea مؤقت للصق
      const textArea = document.createElement("textarea")
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)

      textArea.focus()
      textArea.select()

      // محاولة تنفيذ أمر اللصق
      const successful = document.execCommand("paste")
      const pastedText = textArea.value

      document.body.removeChild(textArea)

      if (successful && pastedText) {
        resolve(pastedText)
      } else {
        resolve("")
      }
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setCurrentImages((prev) => [...prev, result])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setCurrentImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onSave(currentNote, currentImages)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-1 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white"
        >
          <Copy className="h-4 w-4" />
          نسخ
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePaste}
          className="flex items-center gap-1 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white"
        >
          <Clipboard className="h-4 w-4" />
          لصق
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white"
        >
          <ImageIcon className="h-4 w-4" />
          إرفاق صورة
        </Button>
      </div>

      <Textarea
        value={currentNote}
        onChange={(e) => setCurrentNote(e.target.value)}
        placeholder="اكتب ملاحظتك هنا..."
        className="min-h-[120px] resize-vertical bg-slate-800 border-slate-600 text-white"
      />

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />

      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {currentImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image || "/placeholder.svg"}
                alt={`صورة ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-slate-600"
                onClick={() => setSelectedImage(image)}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
          حفظ
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          إلغاء
        </Button>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-4xl">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="صورة مكبرة"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
