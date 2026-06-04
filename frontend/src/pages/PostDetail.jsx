import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ParagraphNode, TextNode } from 'lexical';
import ExampleTheme from '../components/post/editor/ExampleTheme.js';
import { ImageNode } from '../components/post/editor/ImageNode.jsx';
import { getPost } from '../api/postApi';
import './PostDetail.css';
import '../components/post/editor/Editor.css';

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

function ContentLoader({ content }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        if (!content) return;
        try {
            const state = editor.parseEditorState(content);
            editor.setEditorState(state);
        } catch (e) {
            console.error('Failed to parse content:', e);
        }
    }, [editor, content]);
    return null;
}

const editorConfig = {
    editable: false,
    namespace: 'PostViewer',
    nodes: [ParagraphNode, TextNode, ImageNode],
    onError(error) { throw error; },
    theme: ExampleTheme,
};

export default function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() => {
        getPost(id).then(setPost).catch(console.error);
    }, [id]);

    if (!post) return null;

    return (
        <main className="contents-container crimson-text-regular">
            <div className="post-detail">
                <h1 className="post-detail-title">{post.title}</h1>
                <span className="post-detail-date">{formatDate(post.createdAt)}</span>
                <div className="post-detail-divider" />
                <LexicalComposer initialConfig={editorConfig} key={post.id}>
                    <ContentLoader content={post.content} />
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="post-detail-content" />}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </LexicalComposer>

                {post.files && post.files.length > 0 && (
                    <div className="post-detail-attachments">
                        <span className="post-detail-attachments-label">Attachments</span>
                        {post.files.map(file => (
                            <a
                                key={file.id}
                                className="post-detail-attachment-item"
                                href={file.fileUrl}
                                download={file.originalName}>
                                {file.originalName}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
