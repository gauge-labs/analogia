import { Hotkey } from "@/components/hotkey";
import { useEditorEngine } from "@/components/store";
import { EditorMode } from "@analogia/models/editor";
import { HotkeyLabel } from "@analogia/ui-v4/hotkey-label";
import { ToggleGroup, ToggleGroupItem } from "@analogia/ui-v4/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@analogia/ui-v4/tooltip";
import { observer } from "mobx-react-lite";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

const MODE_TOGGLE_ITEMS: {
  mode: EditorMode;
  hotkey: Hotkey;
}[] = [
  {
    mode: EditorMode.DESIGN,
    hotkey: Hotkey.SELECT,
  },
  {
    mode: EditorMode.PREVIEW,
    hotkey: Hotkey.PREVIEW,
  },
];

export const ModeToggle = observer(() => {
  const t = useTranslations();
  const editorEngine = useEditorEngine();
  const mode: EditorMode.DESIGN | EditorMode.PREVIEW = getNormalizedMode(
    editorEngine.state.editorMode,
  );

  function getNormalizedMode(unnormalizedMode: EditorMode) {
    return unnormalizedMode === EditorMode.PREVIEW
      ? EditorMode.PREVIEW
      : EditorMode.DESIGN;
  }

  return (
    <TooltipProvider>
      <div className="relative">
        <ToggleGroup
          className="mt-1 h-7 font-normal"
          type="single"
          value={mode}
          onValueChange={(value) => {
            if (value) {
              editorEngine.state.editorMode = value as EditorMode;
            }
          }}
        >
          {MODE_TOGGLE_ITEMS.map((item) => (
            <Tooltip key={item.mode}>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  variant={"custom-overline"}
                  value={item.mode}
                  aria-label={item.hotkey.description}
                  className={`px-4 py-2 whitespace-nowrap transition-all duration-150 ease-in-out ${
                    mode === item.mode
                      ? "text-active hover:text-active font-medium"
                      : "hover:text-foreground-hover font-normal"
                  }`}
                >
                  {t(`editor.modes.${item.mode.toLowerCase()}.name`)}
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <HotkeyLabel hotkey={item.hotkey} />
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
        <motion.div
          className="bg-foreground absolute -top-1 h-0.5"
          initial={false}
          animate={{
            width: "50%",
            x: mode === EditorMode.DESIGN ? "0%" : "100%",
          }}
          transition={{
            type: "tween",
            ease: "easeInOut",
            duration: 0.2,
          }}
        />
      </div>
    </TooltipProvider>
  );
});
