import { YouTubeNode } from "@/components/editor/nodes/embeds/youtube-node"
import { ImageNode } from "@/components/editor/nodes/image-node"
import { CodeHighlightNode, CodeNode } from "@lexical/code"
import { AutoLinkNode, LinkNode } from "@lexical/link"
import { ListItemNode, ListNode } from "@lexical/list"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table"
import {
  type Klass,
  type LexicalNode,
  type LexicalNodeReplacement,
  ParagraphNode,
  TextNode,
} from "lexical"

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> =[
  HeadingNode,
  ParagraphNode,
  TextNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  CodeNode,
  CodeHighlightNode,
  ImageNode,
  AutoLinkNode,
  YouTubeNode,
]
