"use client";

import { useState } from "react";

export default function ContactPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [status, setStatus] = useState<string | null>(null);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setStatus(null);
		try {
			// For now send to /api/contact if backend route exists, otherwise just simulate
			const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000') + '/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message })
			});
			if (!res.ok) throw new Error('Failed to send');
			setStatus('Message sent — we will reply soon.');
			setName(''); setEmail(''); setMessage('');
		} catch (err:any) {
			setStatus('Failed to send message.');
		}
	}

	return (
		<div className="container mx-auto px-6 py-12 max-w-2xl">
			<h1 className="text-2xl font-semibold">Contact us</h1>
			<p className="muted mt-2">Have a question? Send us a message and we'll get back to you.</p>

			<form onSubmit={submit} className="mt-6 space-y-4">
				<input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" className="w-full p-3 border rounded-md" />
				<input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Your email" className="w-full p-3 border rounded-md" />
				<textarea value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Message" className="w-full p-3 border rounded-md h-32" />
				{status && <div className="text-sm muted">{status}</div>}
				<div>
					<button className="btn btn-primary" type="submit">Send message</button>
				</div>
			</form>
		</div>
	);
}
