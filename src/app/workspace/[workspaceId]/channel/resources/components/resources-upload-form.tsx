"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ResourceDialog from "./resource-dialog";

const ResourcesUploadForm = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        className="w-full h-56 border-dashed border-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" />
        Add new resources
      </Button>

      <ResourceDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export default ResourcesUploadForm;
