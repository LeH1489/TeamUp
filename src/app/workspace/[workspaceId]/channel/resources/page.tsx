"use client";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { HeaderResources } from "./components/header-resources";
import ResourceCard from "./components/resource-card";
import ResourcesUploadForm from "./components/resources-upload-form";
import { useGetResources } from "@/features/resources/api/use-get-resources";
import { Loader } from "lucide-react";

const ResourcesPage = () => {
  const workspaceId = useWorkspaceId();

  const { data: resources, isLoading: isLoadingResources } = useGetResources({
    workspaceId,
  });

  return (
    <div className="flex flex-col h-full">
      <HeaderResources resourceName="Public Resources" />
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-3 overflow-y-auto">
        <ResourcesUploadForm />
        {resources?.map((resource) => (
          <ResourceCard
            key={resource._id}
            id={resource._id}
            resourceName={resource.name}
            description={resource.description || ""}
            fileType={resource.fileType}
            url={resource.url || ""}
            uploadedBy={resource.uploader?.name || ""}
          />
        ))}
        {isLoadingResources && (
          <div className="col-span-full flex justify-center p-4">
            <Loader className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
