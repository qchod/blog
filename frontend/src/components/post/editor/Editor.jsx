/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import {
    $isTextNode,
    isHTMLElement,
    ParagraphNode,
    TextNode,
} from 'lexical';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/Toast';

import ExampleTheme from './ExampleTheme.js';
import { ImageNode } from './ImageNode.jsx';
import ImagePlugin from './plugins/ImagePlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { parseAllowedColor, parseAllowedFontSize } from './styleConfig';
import { savePost } from '../../../api/postApi';

import "./Editor.css"

const removeStylesExportDOM = (editor, target) => {
    const output = target.exportDOM(editor);
    if (output && isHTMLElement(output.element)) {
        for (const el of [
            output.element,
            ...output.element.querySelectorAll('[style],[class]'),
        ]) {
            el.removeAttribute('class');
            el.removeAttribute('style');
        }
    }
    return output;
};

const exportMap = new Map([
    [ParagraphNode, removeStylesExportDOM],
    [TextNode, removeStylesExportDOM],
]);

const getExtraStyles = (element) => {
    let extraStyles = '';
    const fontSize = parseAllowedFontSize(element.style.fontSize);
    const backgroundColor = parseAllowedColor(element.style.backgroundColor);
    const color = parseAllowedColor(element.style.color);

    if (fontSize && fontSize !== '15px') {
        extraStyles += `font-size: ${fontSize};`;
    }
    if (backgroundColor && backgroundColor !== 'rgb(255, 255, 255)') {
        extraStyles += `background-color: ${backgroundColor};`;
    }
    if (color && color !== 'rgb(0, 0, 0)') {
        extraStyles += `color: ${color};`;
    }

    return extraStyles;
};

const constructImportMap = () => {
    const importMap = {};

    for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
        importMap[tag] = (importNode) => {
            const importer = fn(importNode);
            if (!importer) return null;

            return {
                ...importer,
                conversion: (element) => {
                    const output = importer.conversion(element);
                    if (
                        output === null ||
                        output.forChild === undefined ||
                        output.after !== undefined ||
                        output.node !== null
                    ) {
                        return output;
                    }
                    const extraStyles = getExtraStyles(element);
                    if (extraStyles) {
                        const { forChild } = output;
                        return {
                            ...output,
                            forChild: (child, parent) => {
                                const textNode = forChild(child, parent);
                                if ($isTextNode(textNode)) {
                                    textNode.setStyle(textNode.getStyle() + extraStyles);
                                }
                                return textNode;
                            },
                        };
                    }
                    return output;
                },
            };
        };
    }

    return importMap;
};

const editorConfig = {
    html: {
        export: exportMap,
        import: constructImportMap(),
    },
    namespace: 'React.js Demo',
    nodes: [ParagraphNode, TextNode, ImageNode],
    onError(error) {
        throw error;
    },
    theme: ExampleTheme,
};

export default function Editor() {
    const [title, setTitle] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const editorStateRef = useRef(null);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSave = async () => {
        if (!title.trim()) {
            showToast('Title is required.');
            return;
        }
        const content = JSON.stringify(editorStateRef.current?.toJSON() ?? {});
        setIsSaving(true);
        try {
            await savePost({ title, content, attachments });
            showToast('Post published.');
            navigate('/post');
        } catch (e) {
            console.error(e);
            showToast('Failed to publish post.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAttachmentAdd = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
        e.target.value = '';
    };

    const handleAttachmentRemove = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="post-wrapper">
            <LexicalComposer initialConfig={editorConfig}>
                <div className="editor-toolbar-box">
                    <ToolbarPlugin onAttachmentAdd={handleAttachmentAdd} />
                </div>
                <div className="editor-content-box">
                    <input
                        className="post-title-input"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    <div className="title-divider" />
                    <div className="editor-inner">
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable
                                    className="editor-input"
                                />
                            }
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin />
                        <AutoFocusPlugin />
                        <ImagePlugin />
                        <OnChangePlugin onChange={(state) => { editorStateRef.current = state; }} />
                    </div>
                </div>
            </LexicalComposer>

            {attachments.length > 0 && (
                <div className="post-attachments">
                    <div className="attachment-list">
                        {attachments.map((file, i) => (
                            <div key={i} className="attachment-item">
                                <span className="attachment-name">{file.name}</span>
                                <button
                                    className="attachment-remove"
                                    onClick={() => handleAttachmentRemove(i)}
                                    aria-label="첨부파일 삭제">
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="post-actions">
                <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={isSaving}>
                    {isSaving ? 'Publishing...' : 'Publish'}
                </button>
            </div>
        </div>
    );
}
