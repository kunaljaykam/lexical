/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {LexicalCommand} from 'lexical';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
  $getNearestBlockElementAncestorOrThrow,
  mergeRegister,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  createCommand,
  FORMAT_ELEMENT_COMMAND,
} from 'lexical';
import {useEffect} from 'react';

import {$isTweetNode} from '../nodes/TweetNode.jsx';
import {
  $createYouTubeNode,
  $isYouTubeNode,
  YouTubeNode,
} from '../nodes/YouTubeNode.jsx';

export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand();

export default function YouTubePlugin(): React$Node {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([YouTubeNode])) {
      throw new Error('YouTubePlugin: YouTubeNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_YOUTUBE_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const focusNode = selection.focus.getNode();
            if (focusNode !== null) {
              const youTubeNode = $createYouTubeNode(payload);
              selection.focus
                .getNode()
                .getTopLevelElementOrThrow()
                .insertAfter(youTubeNode);
              const paragraphNode = $createParagraphNode();
              youTubeNode.insertAfter(paragraphNode);
              paragraphNode.select();
            }
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        FORMAT_ELEMENT_COMMAND,
        (format) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
            return false;
          }
          const nodes = selection.getNodes();
          for (const node of nodes) {
            if ($isTweetNode(node) || $isYouTubeNode(node)) {
              node.setFormat(format);
            } else {
              const element = $getNearestBlockElementAncestorOrThrow(node);
              element.setFormat(format);
            }
          }
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);
  return null;
}
