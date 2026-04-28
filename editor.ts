'use client';
import React, { useState, useRef } from 'react';
import { Message } from '@/types';
export default function ChatEditor() {
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState('');
const [selectedImage, setSelectedImage] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
if (file) {
const reader = new FileReader();
reader.onloadend = () => setSelectedImage(reader.result as string);
reader.readAsDataURL(file);
}
};
const handleSend = async () => {
if (!input || !selectedImage) return;
const userMsg: Message = { id: Date.now().toString(), role: 'user', content:
input, image: selectedImage };
setMessages(prev => [...prev, userMsg]);
setLoading(true);
setInput('');
try {
const res = await fetch('/api/edit', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ image: selectedImage, prompt: input }),
});
const data = await res.json();
const assistantMsg: Message = {
id: (Date.now() + 1).toString(),
role: 'assistant',
content: 'Here is your edited image:',
image: data.url
};
setMessages(prev => [...prev, assistantMsg]);
setSelectedImage(data.url); // Set result as next base image
} catch (err) {
console.error(err);
} finally {
setLoading(false);
}
};
return (
<div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
<div className="flex-1 overflow-y-auto space-y-4 mb-4 border rounded-lg p-
4 bg-gray-50">
{messages.map((m) => (
<div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' :
'justify-start'}`}>
<div className={`max-w-[80%] p-3 rounded-lg ${m.role === 'user' ?
'bg-blue-600 text-white' : 'bg-white border'}`}>
<p>{m.content}</p>
{m.image && <img src={m.image} alt="Preview" className="mt-2
rounded max-h-64 object-cover" />}
</div>
</div>
))}
{loading && <div className="text-gray-500 animate-pulse">AI is
editing...</div>}
</div>
<div className="space-y-2">
{selectedImage && (
<div className="relative inline-block">
<img src={selectedImage} className="h-20 w-20 object-cover rounded
border-2 border-blue-500" />
<button onClick={() => setSelectedImage(null)} className="absolute -
top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs">X</button>
</div>
)}
<div className="flex gap-2">
<input
type="file"
ref={fileInputRef}
onChange={handleFileUpload}
className="hidden"
accept="image/png"
/>
<button
onClick={() => fileInputRef.current?.click()}
className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
>
Upload PNG
</button>
<input
value={input}
onChange={(e) => setInput(e.target.value)}
placeholder="Describe changes (e.g., 'add a cat on the sofa')"
className="flex-1 p-2 border rounded"
onKeyDown={(e) => e.key === 'Enter' && handleSend()}
/>
<button
onClick={handleSend}
disabled={loading || !selectedImage}
className="px-6 py-2 bg-blue-600 text-white rounded disabled:bg-
blue-300"
>
Edit
</button>
</div>
</div>
</div>
);
}
