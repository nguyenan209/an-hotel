"use client";

import { useState } from "react";
import { User, Edit, Trash2, MoreVertical } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  message: string;
  createdAt: string;
  isAdmin: boolean;
  adminName?: string | null;
  senderName?: string;
  senderType?: string;
}

interface ConversationHistoryProps {
  initialMessage: {
    content: string;
    createdAt: string;
  };
  responses: Message[];
  editingResponseId?: string | null;
  editedMessage?: string;
  setEditingResponseId?: (id: string | null) => void;
  setEditedMessage?: (message: string) => void;
  setComplaint?: (callback: (prev: any) => any) => void;
  isAdmin?: boolean;
  onEditMessage?: (id: string, newContent: string) => void;
  onDeleteMessage?: (id: string) => void;
}

export function ConversationHistory({
  initialMessage,
  responses,
  editingResponseId,
  editedMessage,
  setEditingResponseId,
  setEditedMessage,
  setComplaint,
  isAdmin = false,
  onEditMessage,
  onDeleteMessage,
}: ConversationHistoryProps) {
  const [localEditingId, setLocalEditingId] = useState<string | null>(null);
  const [localEditedMessage, setLocalEditedMessage] = useState("");

  // Use either the props or local state for editing
  const currentEditingId =
    editingResponseId !== undefined ? editingResponseId : localEditingId;
  const currentEditedMessage =
    editedMessage !== undefined ? editedMessage : localEditedMessage;
  const setCurrentEditingId = setEditingResponseId || setLocalEditingId;
  const setCurrentEditedMessage = setEditedMessage || setLocalEditedMessage;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("en-US", { month: "long" });
    const day = date.getDate();
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, "0");
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;

    return `${month} ${day}, ${year} at ${formattedHour}:${minute} ${period}`;
  };

  const handleSaveEdit = (id: string) => {
    if (onEditMessage) {
      onEditMessage(id, currentEditedMessage);
    } else if (setComplaint) {
      setComplaint((prev: any) => ({
        ...prev,
        messages: prev.messages.map((msg: any) =>
          msg.id === id ? { ...msg, message: currentEditedMessage } : msg
        ),
      }));
    }
    setCurrentEditingId(null);
  };

  const handleDeleteMessage = (id: string) => {
    if (onDeleteMessage) {
      onDeleteMessage(id);
    } else if (setComplaint) {
      setComplaint((prev: any) => ({
        ...prev,
        messages: prev.messages.filter((msg: any) => msg.id !== id),
      }));
    }
  };

  // Combine all messages in chronological order
  const allMessages = [
    {
      id: "initial",
      message: initialMessage.content,
      createdAt: initialMessage.createdAt,
      isAdmin: false,
      isInitial: true,
      senderName: responses[0]?.senderName || "Customer",
      senderType: "customer",
    },
    ...responses,
  ].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      {allMessages.map((message, index) => {
        const isCurrentUserMessage = isAdmin
          ? message.isAdmin
          : !message.isAdmin;
        const isEditing = currentEditingId === message.id;

        return (
          <div key={message.id} className="flex">
            {/* For admin/owner messages, always show on the left */}
            <div
              className={`max-w-[70%] ${
                message.isAdmin
                  ? "mr-auto"
                  : isCurrentUserMessage
                  ? "ml-auto"
                  : "mr-auto"
              }`}
            >
              {/* Message header */}
              <div className="flex items-center gap-2 mb-2">
                {message.isAdmin ? (
                  // Admin/Owner header - always on the left
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="text-sm font-medium">
                      {message.senderName || "Admin"}
                    </span>
                    <span className="text-sm text-gray-600">
                      •&nbsp;{formatDate(message.createdAt)}
                    </span>
                  </div>
                ) : (
                  // Customer header - depends on perspective
                  <div
                    className={`flex items-center gap-2 ${
                      isCurrentUserMessage ? "flex-row-reverse ml-auto" : ""
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-pink-500" />
                    </div>
                    <span className="text-sm font-medium">
                      {isAdmin ? message.senderName || "Customer" : "You"}
                    </span>
                    <span className="text-sm text-gray-600">
                      •&nbsp;{formatDate(message.createdAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Message bubble */}
              <div className="relative group">
                <div
                  className={`${
                    message.isAdmin ? "bg-green-100" : "bg-pink-100"
                  } rounded-lg p-4 relative`}
                >
                  {/* Dropdown menu for user's own messages */}
                  {isCurrentUserMessage && !("isInitial" in message) && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-white/50">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentEditingId(message.id);
                              setCurrentEditedMessage(message.message);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}

                  {/* Message content */}
                  {isEditing ? (
                    <div>
                      <Textarea
                        value={currentEditedMessage}
                        onChange={(e) =>
                          setCurrentEditedMessage(e.target.value)
                        }
                        className="w-full bg-transparent border border-gray-300 rounded p-2 resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(message.id)}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800">{message.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
