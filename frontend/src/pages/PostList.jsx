import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/contents/Header.jsx';
import { getPostList } from '../api/postApi';
import './PostList.css';

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const PostList = ({ isAdmin }) => {
    const [posts, setPosts] = useState([]);
    const [viewType, setViewType] = useState('list');
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);
    const lastIdRef = useRef(0);
    const loadingRef = useRef(false);
    const sentinelRef = useRef(null);
    const navigate = useNavigate();

    const fetchMore = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        try {
            const data = await getPostList(lastIdRef.current, 10);
            setPosts(prev => [...prev, ...data.posts]);
            setHasNext(data.hasNext);
            if (data.posts.length > 0) {
                lastIdRef.current = data.posts[data.posts.length - 1].id;
            }
        } catch (e) {
            console.error(e);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMore();
    }, [fetchMore]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasNext || loading) return;

        const observer = new IntersectionObserver(
            entries => { if (entries[0].isIntersecting) fetchMore(); },
            { threshold: 0.1 }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loading, hasNext, fetchMore]);

    return (
        <main className="contents-container crimson-text-regular">
            <Header title="POST" />
            <div className="post-list-controls">
                <div className="view-toggle">
                    <button
                        className={`view-btn${viewType === 'list' ? ' active' : ''}`}
                        onClick={() => setViewType('list')}
                        aria-label="List view">
                        <i className="bi bi-list-ul" />
                    </button>
                    <button
                        className={`view-btn${viewType === 'album' ? ' active' : ''}`}
                        onClick={() => setViewType('album')}
                        aria-label="Album view">
                        <i className="bi bi-grid" />
                    </button>
                </div>
                {isAdmin && (
                    <button className="post-write-btn" onClick={() => navigate('/post/write')}>
                        Write
                    </button>
                )}
            </div>

            {viewType === 'list' ? (
                <div className="post-list-view">
                    {posts.map(post => (
                        <div key={post.id} className="post-list-item">
                            <span className="post-list-title">{post.title}</span>
                            {post.summary && <p className="post-list-summary">{post.summary}</p>}
                            <span className="post-list-date">{formatDate(post.createdAt)}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="post-album-view">
                    {posts.map(post => (
                        <div key={post.id} className="post-album-item">
                            <div className="post-album-thumb">
                                {post.thumbnailUrl
                                    ? <img src={post.thumbnailUrl} alt={post.title} />
                                    : <div className="post-album-no-thumb" />}
                            </div>
                            <div className="post-album-info">
                                <span className="post-album-title">{post.title}</span>
                                <p className="post-album-summary">{post.summary ?? ''}</p>
                                <span className="post-album-date">{formatDate(post.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div ref={sentinelRef} />
            {loading && <p className="post-list-loading">Loading...</p>}
        </main>
    );
};

export default PostList;
