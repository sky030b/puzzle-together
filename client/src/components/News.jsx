import { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import PostCreation from '../components/PostCreation';
import '../style/News.css';


const initialPosts = [
  {
    id: '1',
    content: '這是第一篇貼文的內容。',
    comments: [
      { id: 'c1', content: '這是第一篇貼文的第一則留言。' },
      { id: 'c2', content: '這是第一篇貼文的第二則留言。' },
    ],
  },
  {
    id: '2',
    content: '這是第二篇貼文的內容。',
    comments: [
      { id: 'c3', content: '這是第二篇貼文的第一則留言。' },
    ],
  },
];

const News = () => {
  const { playerId } = useParams();
  const { playerInfo } = useContext(AuthContext);
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostContent, setEditingPostContent] = useState('');
  const [newComment, setNewComment] = useState({});

  const handleNewPostChange = (e) => {
    if (e.target.value.length <= 300) {
      setNewPost(e.target.value);
    }
  };

  const handleCreatePost = (post) => {
    setPosts([post, ...posts]);
  };

  const handleCancel = () => {
    setNewPost('');
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setEditingPostContent(post.content);
  };

  const handleEditingPostChange = (e) => {
    if (e.target.value.length <= 300) {
      setEditingPostContent(e.target.value);
    }
  };

  const handleSaveEdit = () => {
    setPosts(posts.map(post => (post.id === editingPostId ? { ...post, content: editingPostContent } : post)));
    setEditingPostId(null);
    setEditingPostContent('');
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditingPostContent('');
  };

  const handleNewCommentChange = (e, postId) => {
    if (e.target.value.length <= 100) {
      setNewComment({ ...newComment, [postId]: e.target.value });
    }
  };

  const handleCreateComment = (postId) => {
    const newCommentData = {
      id: Date.now().toString(),
      content: newComment[postId],
    };
    setPosts(posts.map(post => (
      post.id === postId ? { ...post, comments: [...post.comments, newCommentData] } : post
    )));
    setNewComment({ ...newComment, [postId]: '' });
  };

  return (
    <div className="news">
      {playerInfo && playerInfo.playerId === playerId && (
        <PostCreation playerId={playerId} onCreatePost={handleCreatePost} />
      )}
      <div className="posts">
        {posts.map((post) => (
          <div key={post.id} className="post container-bg mb-3 p-3 border rounded">
            <div className="d-flex justify-content-between">
              <div className="post-content">
                {editingPostId === post.id ? (
                  <textarea
                    className="form-control"
                    value={editingPostContent}
                    onChange={handleEditingPostChange}
                    maxLength="300"
                  />
                ) : (
                  <p>{post.content}</p>
                )}
              </div>
              {playerInfo && playerInfo.playerId === playerId && (
                <div className="dropdown">
                  <button className="btn btn-link dropdown-toggle" type="button" id={`dropdownMenuButton-${post.id}`} data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="bi bi-three-dots"></i>
                  </button>
                  <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton-${post.id}`}>
                    <li>
                      <button className="dropdown-item" onClick={() => handleEditPost(post)}>編輯</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            {editingPostId === post.id && (
              <div className="d-flex justify-content-end mt-2">
                <button className="btn btn-secondary me-2" onClick={handleCancelEdit}>取消</button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>儲存</button>
              </div>
            )}
            <div className="comments mt-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="comment mb-2 p-2 border rounded">
                  {comment.content}
                </div>
              ))}
              <textarea
                className="form-control mb-2"
                value={newComment[post.id] || ''}
                onChange={(e) => handleNewCommentChange(e, post.id)}
                placeholder="Add a comment"
                maxLength="100"
              />
              <div className="d-flex justify-content-end">
                <button className="btn btn-primary" onClick={() => handleCreateComment(post.id)}>發布</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
