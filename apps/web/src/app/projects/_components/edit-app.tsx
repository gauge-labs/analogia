import { sendAnalytics } from "@/utils/analytics";
import { Routes } from "@/utils/constants";
import type { Project } from "@analogia/models/projects";
import { Button } from "@analogia/ui-v4/button";
import { Icons } from "@analogia/ui-v4/icons";
import { observer } from "mobx-react-lite";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import type { ComponentProps } from "react";

const ButtonMotion = motion.create(Button);

interface EditAppButtonProps extends ComponentProps<typeof ButtonMotion> {
  project: Project;
}

export const EditAppButton = observer(
  ({ project, ...props }: EditAppButtonProps) => {
    const t = useTranslations();

    const selectProject = (project: Project) => {
      sendAnalytics("open project", { id: project.id, url: project.url });
      redirect(`${Routes.PROJECT}/${project.id}`);
    };

    return (
      <ButtonMotion
        size="default"
        variant={"outline"}
        className="bg-background-active border-border-active w-full gap-2 border-[0.5px] lg:w-auto"
        onClick={() => selectProject(project)}
        {...props}
      >
        <Icons.PencilPaper />
        <p>{t("projects.actions.editApp")}</p>
      </ButtonMotion>
    );
  },
);
