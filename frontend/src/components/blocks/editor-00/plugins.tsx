import { useState } from "react"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin"
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin"
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin"
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin"
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { HistoryToolbarPlugin } from "@/components/editor/plugins/toolbar/history-toolbar-plugin"
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin"
import { Separator } from "@/components/ui/separator"
import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin"
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph"
import { FormatNumberedList } from "@/components/editor/plugins/toolbar/block-format/format-numbered-list"
import { FormatBulletedList } from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list"
import { FormatCheckList } from "@/components/editor/plugins/toolbar/block-format/format-check-list"
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote"
import { FormatCodeBlock } from "@/components/editor/plugins/toolbar/block-format/format-code-block"
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading"
import { CodeLanguageToolbarPlugin } from "@/components/editor/plugins/toolbar/code-language-toolbar-plugin"
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin"
import { SubSuperToolbarPlugin } from "@/components/editor/plugins/toolbar/subsuper-toolbar-plugin"
import { LinkToolbarPlugin } from "@/components/editor/plugins/toolbar/link-toolbar-plugin"
import { ClearFormattingToolbarPlugin } from "@/components/editor/plugins/toolbar/clear-formatting-toolbar-plugin"
import { ElementFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/element-format-toolbar-plugin"
import { BlockInsertPlugin } from "@/components/editor/plugins/toolbar/block-insert-plugin"
import { InsertHorizontalRule } from "@/components/editor/plugins/toolbar/block-insert/insert-horizontal-rule"
import { InsertImage } from "@/components/editor/plugins/toolbar/block-insert/insert-image"
import { InsertTable } from "@/components/editor/plugins/toolbar/block-insert/insert-table"
import { InsertColumnsLayout } from "@/components/editor/plugins/toolbar/block-insert/insert-columns-layout"
import { InsertEmbeds } from "@/components/editor/plugins/toolbar/block-insert/insert-embeds"
import { ActionsPlugin } from "@/components/editor/plugins/actions/actions-plugin"
import { MaxLengthPlugin } from "@/components/editor/plugins/actions/max-length-plugin"
import { CounterCharacterPlugin } from "@/components/editor/plugins/actions/counter-character-plugin"
import { ListMaxIndentLevelPlugin } from "@/components/editor/plugins/list-max-indent-level-plugin"
import { FloatingLinkEditorPlugin } from "@/components/editor/plugins/floating-link-editor-plugin"
import { ImagesPlugin } from "@/components/editor/plugins/images-plugin"
import { LayoutPlugin } from "@/components/editor/plugins/layout-plugin"
import { AutoEmbedPlugin } from "@/components/editor/plugins/embeds/auto-embed-plugin"
import { TwitterPlugin } from "@/components/editor/plugins/embeds/twitter-plugin"
import { YouTubePlugin } from "@/components/editor/plugins/embeds/youtube-plugin"
import { CodeHighlightPlugin } from "@/components/editor/plugins/code-highlight-plugin"
import { CodeActionMenuPlugin } from "@/components/editor/plugins/code-action-menu-plugin"
import { AutoLinkPlugin } from "@/components/editor/plugins/auto-link-plugin"
import { LinkPlugin } from "@/components/editor/plugins/link-plugin"
import { ComponentPickerMenuPlugin } from "@/components/editor/plugins/component-picker-menu-plugin"
import { ParagraphPickerPlugin } from "@/components/editor/plugins/picker/paragraph-picker-plugin"
import { HeadingPickerPlugin } from "@/components/editor/plugins/picker/heading-picker-plugin"
import { TablePickerPlugin } from "@/components/editor/plugins/picker/table-picker-plugin"
import { CheckListPickerPlugin } from "@/components/editor/plugins/picker/check-list-picker-plugin"
import { NumberedListPickerPlugin } from "@/components/editor/plugins/picker/numbered-list-picker-plugin"
import { BulletedListPickerPlugin } from "@/components/editor/plugins/picker/bulleted-list-picker-plugin"
import { QuotePickerPlugin } from "@/components/editor/plugins/picker/quote-picker-plugin"
import { CodePickerPlugin } from "@/components/editor/plugins/picker/code-picker-plugin"
import { DividerPickerPlugin } from "@/components/editor/plugins/picker/divider-picker-plugin"
import { EmbedsPickerPlugin } from "@/components/editor/plugins/picker/embeds-picker-plugin"
import { ImagePickerPlugin } from "@/components/editor/plugins/picker/image-picker-plugin"
import { ColumnsLayoutPickerPlugin } from "@/components/editor/plugins/picker/columns-layout-picker-plugin"
import { AlignmentPickerPlugin } from "@/components/editor/plugins/picker/alignment-picker-plugin"
import { DraggableBlockPlugin } from "@/components/editor/plugins/draggable-block-plugin"
import { IndexPlugin } from "@/components/editor/plugins/index-plugin"
import { ToggleFullscreen } from "@/components/editor/plugins/toolbar/toggle-fullscreen-plugin"

export function Plugins({ maxLength, className }: { maxLength: number, className: string }) {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null)
  const [isLinkEditMode, setIsLinkEditMode] = useState(false)

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div className="flex-1 flex flex-col relative min-h-0">
      {/* toolbar plugins */}
      <ToolbarPlugin>
        {({ blockType }) => (
          <div className="vertical-align-middle top-0 z-20 flex gap-2 sticky overflow-auto border-b p-1">
            <HistoryToolbarPlugin />
            <Separator orientation="vertical"/> 
            <ToggleFullscreen />
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading levels={["h1", "h2", "h3"]}/>
              <FormatNumberedList />
              <FormatBulletedList />
              <FormatCheckList />
              <FormatCodeBlock />
              <FormatQuote />
            </BlockFormatDropDown>

            {blockType === 'code' 
              ? <CodeLanguageToolbarPlugin /> 
              : <>
                <FontFormatToolbarPlugin />
                <Separator orientation="vertical" />
                <SubSuperToolbarPlugin />
                <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
                <Separator orientation="vertical" />
                <ClearFormattingToolbarPlugin />
                <Separator orientation="vertical" />
                <ElementFormatToolbarPlugin />
                <Separator orientation="vertical" />
                <BlockInsertPlugin>
                  <InsertHorizontalRule />
                  <InsertImage />
                  <InsertTable />
                  <InsertColumnsLayout />
                  <InsertEmbeds />
                </BlockInsertPlugin>
                <Separator orientation="vertical"/>
                <IndexPlugin />
              </>
            }
          </div>
        )}
      </ToolbarPlugin>

      <div className={`relative flex flex-col flex-1 pl-4 overflow-auto min-h-0 ${className}`}>
        <RichTextPlugin
          contentEditable={
            <div className="flex-1 flex flex-col w-full min-h-0">
              <div ref={onRef} className="w-full flex-1 overflow-auto">
                <ContentEditable placeholder={"Start typing ..."} />
              </div>
            </div>
          }
          
          ErrorBoundary={LexicalErrorBoundary}
        />

        {/* editor plugins */}
        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <ClickableLinkPlugin />
        <HorizontalRulePlugin />
        <TabIndentationPlugin />
        <TablePlugin />
      
        <HashtagPlugin />
        <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
        {/* <KeywordsPlugin /> */}
        {/* <EmojisPlugin /> */}
        <ImagesPlugin />
        <LayoutPlugin />
        <AutoEmbedPlugin />
        <TwitterPlugin />
        <YouTubePlugin />
        <CodeHighlightPlugin />
        <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
        
        {/* <TypingPerfPlugin /> */}
        {/* <TabFocusPlugin /> */}
        <AutoLinkPlugin />
        <LinkPlugin />
        <ComponentPickerMenuPlugin
          baseOptions={[
            ParagraphPickerPlugin(),
            HeadingPickerPlugin({ n: 1 }),
            HeadingPickerPlugin({ n: 2 }),
            HeadingPickerPlugin({ n: 3 }),
            TablePickerPlugin(),
            CheckListPickerPlugin(),
            NumberedListPickerPlugin(),
            BulletedListPickerPlugin(),
            QuotePickerPlugin(),
            CodePickerPlugin(),
            DividerPickerPlugin(),
            EmbedsPickerPlugin({ embed: "tweet" }),
            EmbedsPickerPlugin({ embed: "youtube-video" }),
            ImagePickerPlugin(),
            ColumnsLayoutPickerPlugin(),
            AlignmentPickerPlugin({ alignment: "left" }),
            AlignmentPickerPlugin({ alignment: "center" }),
            AlignmentPickerPlugin({ alignment: "right" }),
            AlignmentPickerPlugin({ alignment: "justify" }),
          ]}
        />
        {/* <ContextMenuPlugin /> */}
        {/* <DragDropPastePlugin /> */}
        <FloatingLinkEditorPlugin
          anchorElem={floatingAnchorElem}
          isLinkEditMode={isLinkEditMode}
          setIsLinkEditMode={setIsLinkEditMode}
        />
        {/* <FloatingTextFormatToolbarPlugin
          anchorElem={floatingAnchorElem}
          setIsLinkEditMode={setIsLinkEditMode}
        /> */}
        <ListMaxIndentLevelPlugin />
      </div>
      
      <ActionsPlugin>
        <div className="clear-both flex relative bottom-0 items-center z-20 justify-between gap-2 overflow-auto border-t p-1">
          <div className="flex flex-1 justify-start">
            <MaxLengthPlugin maxLength={maxLength} />
            {/* <CharacterLimitPlugin maxLength={MAX_LENGTH} charset="UTF-16" /> */}
          </div>
          <div>
            <CounterCharacterPlugin charset="UTF-16" />
          </div>
          <div className="flex flex-1 justify-end">
            {/* <SpeechToTextPlugin /> */}
            {/* <ShareContentPlugin /> */}
            {/* <ImportExportPlugin /> */}
            {/* <ClearEditorActionPlugin /> */}
            {/* <ClearEditorPlugin /> */}
          </div>
        </div>
      </ActionsPlugin>
    </div>
  )
}


