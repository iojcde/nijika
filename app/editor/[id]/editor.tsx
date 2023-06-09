"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
import { Editor, rootCtx } from "@milkdown/core";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { gfm } from "@milkdown/preset-gfm";
import { commonmark } from "@milkdown/preset-commonmark";
import { theme } from "@/milkdown/theme";
import { clipboard } from "@milkdown/plugin-clipboard";
import { history } from "@milkdown/plugin-history";
import { defaultValueCtx } from "@milkdown/core";
import { placeholder, placeholderCtx } from "@/milkdown/plugins/placeholder";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { debounce } from "lodash";
import { useEditorState } from "@/state/editor";
import type { save } from "./save";

const MilkdownEditor: React.FC<{
  content?: string;
  save: typeof save;
  id: string;
}> = ({ content: defaultContent, id, save }) => {
  const {
    title: currentTitle,
    setSaved,
    setContent,
    setIsPending,
    content,
    isPending,
  } = useEditorState();

  const saveFn = useCallback(
    debounce(async ({ content }: { content: string }) => {
      setIsPending(true);
      console.log("saving content automatically");

      const result = await save({
        id,
        content: content,
      });

      setIsPending(false);
      console.log(result)
      
      setSaved(true);
    }, 5000),
    []
  );

  const { get } = useEditor(
    (root) =>
      Editor.make()
        .config(theme)
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(placeholderCtx, "Type here to write your post...");
        })
        .config((ctx) => {
          defaultContent && ctx.set(defaultValueCtx, defaultContent);
        })
        .use(commonmark)
        .use(gfm)
        .use(clipboard)
        .use(history)
        .use(placeholder)
        .use(listener)
        .config((ctx) => {
          const listener = ctx.get(listenerCtx);

          listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
            setSaved(false);
            if (markdown !== prevMarkdown) {
              console.log("changed");
              setContent(markdown);
              saveFn({ content: markdown });
            }
          });
        })
    // .use(collab)
  );

  useEffect(() => {
    setContent(defaultContent ?? "");
  }, [setContent, defaultContent]);

  // const doc = new Doc();
  // const wsProvider = new WebsocketProvider(
  //   "ws://localhost:1234",
  //   "milkdown",
  //   doc
  // );

  // if (status === "authenticated") {
  //   wsProvider.awareness.setLocalStateField("user", {
  //     color: "#FFC0CB",
  //     name: session?.user.name,
  //   });
  // }
  // get()?.action((ctx) => {
  //   const collabService = ctx.get(collabServiceCtx);
  //   collabService.setOptions({
  //     yCursorOpts: {
  //       cursorBuilder: (user) => {
  //         const cursor = document.createElement("span");
  //         cursor.classList.add("ProseMirror-yjs-cursor");
  //         cursor.setAttribute("style", `border-color: ${user.color}`);
  //         const userDiv = document.createElement("div");
  //         userDiv.setAttribute("style", `background-color: ${user.color}`);
  //         userDiv.classList.add("p-1", "px-2", "text-xs", "rounded-full");
  //         userDiv.insertBefore(document.createTextNode(user.name), null);
  //         cursor.insertBefore(userDiv, null);
  //         return cursor;
  //       },
  //     },
  //   });

  // collabService
  //   // bind doc and awareness
  //   .bindDoc(doc)
  //   .setAwareness(wsProvider.awareness)
  //   // connect yjs with milkdown
  //   .connect();

  // wsProvider.once("synced", async (isSynced: boolean) => {
  //   collabService
  //     // apply your template
  //     .applyTemplate(content)
  //     // don't forget connect
  //     .connect();
  // });
  // });

  return (
    <div>
      <Milkdown />
    </div>
  );
};

const MilkdownEditorWrapper: React.FC<{
  content?: string;

  save: typeof save;
  id: string;
}> = ({ content, save, id }) => {
  return (
    <MilkdownProvider>
      <MilkdownEditor content={content} save={save} id={id} />
    </MilkdownProvider>
  );
};
export default MilkdownEditorWrapper;
