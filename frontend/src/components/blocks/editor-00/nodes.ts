import { TweetNode } from "@/components/editor/nodes/embeds/tweet-node"
import { YouTubeNode } from "@/components/editor/nodes/embeds/youtube-node"
import { ImageNode } from "@/components/editor/nodes/image-node"
import { LayoutContainerNode } from "@/components/editor/nodes/layout-container-node"
import { LayoutItemNode } from "@/components/editor/nodes/layout-item-node"
import { CodeHighlightNode, CodeNode } from "@lexical/code"
import { AutoLinkNode, LinkNode } from "@lexical/link"
import { ListItemNode, ListNode } from "@lexical/list"
import { HashtagNode } from '@lexical/hashtag'
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table"
import {
  type Klass,
  type LexicalNode,
  type LexicalNodeReplacement,
  ParagraphNode,
  TextNode,
} from "lexical"
import { MentionNode } from "@/components/editor/nodes/mention-node"

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> =[
  HeadingNode, 
  ParagraphNode, 
  TextNode, 
  QuoteNode,
  ListNode,
  ListItemNode,

  LinkNode,
  // OverflowNode,
  HashtagNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  CodeNode,
  CodeHighlightNode,
  HorizontalRuleNode,
  MentionNode,
  ImageNode,
  // EmojiNode,
  // KeywordNode,
  LayoutContainerNode,
  LayoutItemNode,
  AutoLinkNode,
  TweetNode,
  YouTubeNode,
  // AutocompleteNode,
]
