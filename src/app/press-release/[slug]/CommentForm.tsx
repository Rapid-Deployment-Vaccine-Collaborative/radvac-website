"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

interface Props {
  postId: number;
}

export function CommentForm({ postId }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          author_name: name,
          author_email: email,
          content,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Submission failed (${res.status})`);
      }

      setStatus("success");
      setName("");
      setEmail("");
      setContent("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Submission failed");
    }
  }

  if (status === "success") {
    return (
      <div className="p-4 rounded bg-green-50 border border-green-200 text-green-900">
        Thanks — your comment is awaiting moderation.
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">Name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">Email (not published)</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-700">Comment</span>
        <textarea
          required
          rows={5}
          maxLength={5000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={submitting}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      {status === "error" && (
        <p className="text-red-700 text-sm" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="self-start px-5 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Post comment"}
      </button>

      <p className="text-xs text-gray-500">
        Comments are moderated and won&apos;t appear immediately.
      </p>
    </form>
  );
}
