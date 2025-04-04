import type { Project } from "@analogia/models/projects";
import { timeAgo } from "@analogia/utility";
import { observer } from "mobx-react-lite";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { EditAppButton } from "./edit-app";
import { Settings } from "./settings";

const ProjectInfo = observer(
  ({ project, direction }: { project: Project; direction: number }) => {
    const t = useTranslations();
    const variants = {
      enter: (direction: number) => ({
        y: direction > 0 ? 20 : -20,
        opacity: 0,
      }),
      center: {
        y: 0,
        opacity: 1,
      },
      exit: (direction: number) => ({
        y: direction < 0 ? 20 : -20,
        opacity: 0,
      }),
    };

    return (
      project && (
        <>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.p
              key={project.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-foreground-active text-title1 inline-block"
            >
              {project.name}
            </motion.p>
          </AnimatePresence>
          <div className="text-foreground-analogia text-small flex flex-col gap-2 md:flex-row md:gap-7">
            <p>
              {t("projects.select.lastEdited", {
                time: timeAgo(new Date(project.updatedAt).toISOString()),
              })}
            </p>
            <p>{project.url}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-5">
            <EditAppButton project={project} />
            <Settings project={project} />
          </div>
        </>
      )
    );
  },
);

export default ProjectInfo;
