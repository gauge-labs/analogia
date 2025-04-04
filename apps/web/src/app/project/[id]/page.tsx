import { Frames } from "./_components/canvas/frames";

// import { EditPanel } from './EditPanel';
// import { HotkeysModal } from './HotkeysModal';
// import { LayersPanel } from './LayersPanel';
// import { Toolbar } from './Toolbar';

import { Canvas } from "./_components/canvas";
import { EditorTopBar } from "./_components/top-bar";

export default async function Page({ params }: { params: { id: string } }) {
  const id = (await params).id;
  return (
    <div className="relative flex h-screen w-screen flex-row select-none">
      <Canvas>
        <Frames />
      </Canvas>

      <div className="animate-layer-panel-in fixed top-20 left-0">
        {/* <LayersPanel /> */}
      </div>

      <div className="animate-edit-panel-in fixed top-20 right-0">
        {/* <EditPanel /> */}
      </div>

      <div className="animate-toolbar-up absolute bottom-4 left-1/2 -translate-x-1/2 transform">
        {/* <Toolbar /> */}
      </div>

      <div className="absolute top-0 w-full">
        <EditorTopBar />
      </div>
      {/* <HotkeysModal /> */}
    </div>
  );
}
