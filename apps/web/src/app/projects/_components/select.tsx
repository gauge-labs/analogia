"use client";

// import { useProjectsManager } from '@/components/Context';
import type { Project } from "@analogia/models/projects";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Carousel from "./carousel";
import ProjectInfo from "./info";

export const SelectProject = observer(() => {
  const { t } = useTranslation();
  // const projectsManager = useProjectsManager();
  // const [projects, setProjects] = useState<Project[]>(sortProjects(projectsManager.projects));
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // TODO: remove this
  const mockProjects: Project[] = [
    {
      id: "1",
      name: "Project 1",
      folderPath: "Project 1",
      url: "https://www.tailwindcss.com",
      previewImg:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      createdAt: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 30 * 12,
      ).toISOString(),
      updatedAt: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 30 * 12,
      ).toISOString(),
      settings: null,
      commands: null,
      domains: null,
    },
    {
      id: "2",
      name: "Project 2",
      folderPath: "Project 2",
      url: "https://www.tailwindcss.com",
      previewImg:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      settings: null,
      commands: null,
      domains: null,
    },
    {
      id: "3",
      name: "Project 3",
      folderPath: "Project 3",
      url: "https://www.tailwindcss.com",
      previewImg:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
      createdAt: new Date(Date.now() - 1000 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60).toISOString(),
      settings: null,
      commands: null,
      domains: null,
    },
  ];

  const sortProjects = (unsortedProjects: Project[]) => {
    return unsortedProjects.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  };

  const projects = sortProjects(mockProjects);

  const handleProjectChange: (index: number) => void = (index: number) => {
    if (currentProjectIndex === index) {
      return;
    }
    setDirection(index > currentProjectIndex ? 1 : -1);
    setCurrentProjectIndex(index);
  };

  return (
    <div className="flex h-full w-full flex-row">
      <div className="w-3/5">
        <Carousel slides={projects} onSlideChange={handleProjectChange} />
      </div>
      <div className="mr-10 flex w-2/5 flex-col items-start justify-center gap-6 p-4">
        {projects[currentProjectIndex] && (
          <ProjectInfo
            project={projects[currentProjectIndex]}
            direction={direction}
          />
        )}
      </div>
    </div>
  );
});
