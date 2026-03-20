import { useMemo } from "react";
import { EditorShell } from "@mklyml/editor/layout/EditorShell";
import { useCompile } from "@mklyml/editor/store/use-compile";
import { getMklyCompletionData } from "@/lib/mkly";

interface EmbeddedMklyEditorProps {
  documentId?: string | undefined;
}

export function EmbeddedMklyEditor({
  documentId,
}: EmbeddedMklyEditorProps): JSX.Element {
  // Initialize compilation loop (compiles source -> HTML on changes)
  useCompile();

  // Use cached completion data (includes schemas for richer autocomplete)
  const completionData = useMemo(() => getMklyCompletionData(), []);

  return (
    <div className="mkly-editor-root" style={{ height: "100%" }}>
      <EditorShell completionData={completionData} documentId={documentId} />
    </div>
  );
}
