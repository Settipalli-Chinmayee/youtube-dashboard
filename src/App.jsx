import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [videoId, setVideoId] = useState('');
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api'; // Update with your backend URL if deployed

  // Function to load video details and comments
  const handleLoadVideo = async () => {
    console.log(`Loading video with ID: ${videoId}`);
    setLoading(true);
    try {
      const videoRes = await axios.get(`${API_BASE_URL}/video?videoId=${videoId}`);
      setVideo(videoRes.data);

      const commentRes = await axios.get(`${API_BASE_URL}/video/${videoId}/comments`);
      setComments(commentRes.data);
    } catch (err) {
      console.error("Failed to load video or comments:", err);
      alert("Failed to load video or comments. Check the console for more details.");
    }
    setLoading(false);
  };

  // Function to post a new comment
  const handleCommentSubmit = () => {
    if (!commentText) return;

    axios.post(`${API_BASE_URL}/video/${videoId}/comment`, { text: commentText })
      .then(res => {
        setComments([{
          id: res.data.id,
          snippet: {
            textDisplay: res.data.snippet.textDisplay
          },
          replies: []
        }, ...comments]);
        setCommentText('');
      })
      .catch(console.error);
  };

  // Function to post a reply to a comment
  const handleReplySubmit = (commentId) => {
    if (!replyText) return;

    axios.post(`${API_BASE_URL}/video/${videoId}/comment/${commentId}/reply`, { text: replyText })
      .then(res => {
        setComments(comments.map(comment =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, res.data.snippet] }
            : comment
        ));
        setReplyText('');
      })
      .catch(console.error);
  };

  // Function to submit a note
  const handleNoteSubmit = () => {
    if (!noteContent) return;

    axios.post(`${API_BASE_URL}/notes`, { content: noteContent, tags: noteTags })
      .then(res => {
        setNotes([...notes, res.data]);
        setNoteContent('');
        setNoteTags([]);
      })
      .catch(console.error);
  };

  // Function to search for notes
  const handleSearch = (searchTerm) => {
    axios.get(`${API_BASE_URL}/notes?search=${searchTerm}`)
      .then(res => setNotes(res.data))
      .catch(console.error);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>YouTube Video Management</h1>

      <input
        type="text"
        placeholder="Enter Video ID"
        value={videoId}
        onChange={e => setVideoId(e.target.value)}
      />
      <button onClick={handleLoadVideo}>Load Video</button>

      {loading && <p>Loading...</p>}

      {video && (
        <div>
          <h2>{video.title}</h2>
          <p>{video.description}</p>
          <img src={video.thumbnail_url} alt="Thumbnail" width="320" />
          <p>{video.views} views</p>
        </div>
      )}

      <div>
        <h3>Comments</h3>
        <textarea
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="Add a comment"
        />
        <button onClick={handleCommentSubmit}>Post Comment</button>

        {comments.length > 0 && (
          <ul>
            {comments.map(comment => (
              <li key={comment.id}>
                <p>{comment.snippet.textDisplay}</p>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Reply to this comment"
                />
                <button onClick={() => handleReplySubmit(comment.id)}>Reply</button>

                {comment.replies && comment.replies.length > 0 && (
                  <ul>
                    {comment.replies.map((reply, index) => (
                      <li key={index}>
                        <p>{reply.textDisplay}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3>Notes</h3>
        <textarea
          value={noteContent}
          onChange={e => setNoteContent(e.target.value)}
          placeholder="Add a note"
        />
        <button onClick={handleNoteSubmit}>Add Note</button>

        <div>
          <input
            type="text"
            placeholder="Search notes"
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        <ul>
          {notes.map(note => (
            <li key={note.id}>
              <p>{note.content}</p>
              <p><b>Tags:</b> {note.tags ? note.tags.join(', ') : 'No tags'}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
