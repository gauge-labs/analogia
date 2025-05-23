import type { FrameSettings } from "@analogia/models/projects";
import { cn } from "@analogia/ui-v4/utils";
import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { ResizeHandles } from "./resize-handles";

export const Frame = observer(({ settings }: { settings: FrameSettings }) => {
  const position = settings.position;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <div
      className="fixed flex flex-col"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      {/* <BrowserControls
                    webviewRef={domReady ? webviewRef : null}
                    webviewSrc={webviewSrc}
                    setWebviewSrc={setWebviewSrc}
                    selected={selected}
                    hovered={hovered}
                    setHovered={setHovered}
                    setDarkmode={setDarkmode}
                    settings={settings}
                    startMove={startMove}
                    domState={domState}
                    webviewSize={webviewSize}
                /> */}
      <div className="relative">
        <ResizeHandles settings={settings} />
        <iframe
          id={settings.id}
          ref={iframeRef}
          className={cn(
            "h-[60rem] w-[96rem] outline outline-4 backdrop-blur-sm transition",
            // shouldShowDomFailed ? 'bg-transparent' : 'bg-white',
            // selected ? getSelectedOutlineColor() : 'outline-transparent',
          )}
          src={settings.url}
          sandbox="allow-modals allow-forms allow-same-origin allow-scripts allow-popups allow-downloads"
          allow="geolocation; microphone; camera; midi; encrypted-media"
          // style={{
          //     width: clampedDimensions.width,
          //     height: clampedDimensions.height,
          // }}
        />
        {/* <GestureScreen
                        isResizing={isResizing}
                        webviewRef={webviewRef}
                        setHovered={setHovered}
                    /> */}
        {/* {domFailed && shouldShowDomFailed && renderNotRunning()} */}
      </div>
    </div>
  );
});
