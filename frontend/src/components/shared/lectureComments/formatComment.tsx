import { Link } from "react-router-dom";

export function formatComment(text: string) {
  const urlRegex = /\b[a-z][a-z0-9+.-]*:\/\/[^\s/$.?#].[^\s]*/gi;
  // Regex for @mentions (simple word after @)
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // We'll walk through the string and build an array of React elements
  // using a combined regex or a manual loop. For simplicity, we can do a replace with a callback.

  // Option: use a single replace with a function that distinguishes matches
  const combinedRegex = new RegExp(`(${urlRegex.source}|${mentionRegex.source})`, 'g');
  
  let match;
  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const matched = match[0];
    if (matched.match(urlRegex)) {
      // It's a URL
      parts.push(
        <Link key={match.index} to={matched} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          {matched}
        </Link>
      );
    } else if (matched.match(mentionRegex)) {
      // It's a mention
      const username = matched.slice(1);
      parts.push(
        <Link key={match.index} to={`/profile/${username}`} className="text-blue-600 font-medium">
          {matched}
        </Link>
      );
    }
    lastIndex = match.index + matched.length;
  }
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}