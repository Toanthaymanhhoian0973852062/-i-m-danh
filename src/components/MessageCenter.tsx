import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { getMessages, sendMessage, markMessagesRead, getUsers, subscribeStorage } from '../services/storageService';
import { Send, Search, User as UserIcon, MessageSquare, ChevronLeft } from 'lucide-react';

interface MessageCenterProps {
  currentUser: User;
}

export const MessageCenter: React.FC<MessageCenterProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = () => {
      setMessages(getMessages());
      setUsers(getUsers());
    };
    loadData();
    const unsubscribe = subscribeStorage(loadData);
    return () => unsubscribe();
  }, []);

  // Filter contacts based on role
  const contacts = users.filter(u => {
    if (u.id === currentUser.id) return false;
    if (currentUser.role === 'teacher') {
      return u.role === 'parent' || u.role === 'student';
    } else {
      return u.role === 'teacher';
    }
  }).filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Auto-select first contact if none selected
  useEffect(() => {
    if (!selectedContactId && contacts.length > 0) {
      setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (selectedContactId) {
      markMessagesRead(selectedContactId, currentUser.id);
    }
  }, [selectedContactId, messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContactId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContactId) return;
    sendMessage(currentUser.id, selectedContactId, messageText.trim());
    setMessageText('');
  };

  const selectedContact = users.find(u => u.id === selectedContactId);

  const conversationMessages = messages.filter(
    m => (m.senderId === currentUser.id && m.receiverId === selectedContactId) ||
         (m.senderId === selectedContactId && m.receiverId === currentUser.id)
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-[calc(100vh-140px)] min-h-[500px] flex overflow-hidden relative">
      {/* Sidebar Contacts */}
      <div className={`${selectedContactId ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 border-r border-slate-200 bg-slate-50 flex-col absolute md:relative z-10 h-full`}>
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Liên hệ
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map(contact => {
            const unreadCount = messages.filter(
              m => m.senderId === contact.id && m.receiverId === currentUser.id && !m.readStatus
            ).length;

            const isSelected = contact.id === selectedContactId;

            return (
              <button
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={`w-full text-left p-4 border-b border-slate-100 transition flex items-center justify-between ${
                  isSelected ? 'bg-blue-50 border-blue-100' : 'hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-200' : 'bg-slate-200'}`}>
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full" />
                    ) : (
                      <UserIcon className={`w-5 h-5 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`} />
                    )}
                  </div>
                  <div className="truncate">
                    <div className={`text-sm font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {contact.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {contact.role === 'teacher' ? 'Giáo viên' : contact.role === 'parent' ? 'Phụ huynh' : 'Học sinh'}
                    </div>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!selectedContactId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white w-full h-full`}>
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white">
              <button 
                onClick={() => setSelectedContactId(null)}
                className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                {selectedContact.avatar ? (
                  <img src={selectedContact.avatar} alt={selectedContact.name} className="w-full h-full rounded-full" />
                ) : (
                  <UserIcon className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{selectedContact.name}</h3>
                <p className="text-xs text-slate-500">
                  {selectedContact.role === 'teacher' ? 'Giáo viên' : selectedContact.role === 'parent' ? 'Phụ huynh' : 'Học sinh'}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 opacity-20" />
                  <p className="text-sm">Chưa có tin nhắn nào</p>
                </div>
              ) : (
                conversationMessages.map(msg => {
                  const isMine = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                      }`}>
                        <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <MessageSquare className="w-12 h-12 opacity-20" />
            <p className="text-sm">Chọn một liên hệ để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>
    </div>
  );
};
