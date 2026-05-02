"use client"

import { useState } from "react"

import type { SendMessageRequest } from "@/entities/chat/api/chat.schema"
import { uploadImage, uploadPdf } from "@/entities/media/api/media.service"

type SendFn = (payload: SendMessageRequest) => void

/**
 * 메시지 전송 오케스트레이션.
 * 텍스트는 즉시 STOMP publish, 이미지·파일은 REST 업로드 후 attachmentUrl 부착.
 *
 * 여러 이미지를 선택한 경우 각각 별도의 IMAGE 메시지로 전송 (스키마가
 * `attachmentUrl: string` 단일이므로).
 */
export function useMessageCompose(roomId: string, send: SendFn) {
  const [isUploading, setIsUploading] = useState(false)

  const sendText = (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return
    send({ roomId, messageType: "TEXT", content: trimmed })
  }

  const sendImages = async (files: File[]) => {
    if (files.length === 0) return
    setIsUploading(true)
    try {
      for (const file of files) {
        const url = await uploadImage(file, "CHAT")
        send({ roomId, messageType: "IMAGE", content: "", attachmentUrl: url })
      }
    } catch (error) {
      console.error("[chat] image upload failed", error)
      alert("이미지 업로드에 실패했습니다.")
    } finally {
      setIsUploading(false)
    }
  }

  const sendFile = async (file: File) => {
    setIsUploading(true)
    try {
      const result = await uploadPdf(file)
      send({
        roomId,
        messageType: "FILE",
        content: result.originalFileName,
        attachmentUrl: result.fileUrl,
      })
    } catch (error) {
      console.error("[chat] file upload failed", error)
      alert("파일 업로드에 실패했습니다.")
    } finally {
      setIsUploading(false)
    }
  }

  return { sendText, sendImages, sendFile, isUploading }
}
