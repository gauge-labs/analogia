import { SelectProject } from "./_components/select";
import { TopBar } from "./_components/top-bar";

const Projects = () => {
  return (
    <div className="h-full w-full">
      <TopBar />
      <div className="flex w-full justify-center overflow-hidden">
        <SelectProject />
      </div>
    </div>
  );
};

export default Projects;
