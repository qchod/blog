import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $createParagraphNode, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { $createImageNode } from '../ImageNode';

export const INSERT_IMAGE_COMMAND = createCommand('INSERT_IMAGE_COMMAND');

export default function ImagePlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand(
            INSERT_IMAGE_COMMAND,
            ({ src, altText }) => {
                const imageNode = $createImageNode(src, altText);
                $insertNodeToNearestRoot(imageNode);

                if (imageNode.getNextSibling() === null) {
                    const paragraph = $createParagraphNode();
                    imageNode.insertAfter(paragraph);
                    paragraph.select();
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);

    return null;
}
