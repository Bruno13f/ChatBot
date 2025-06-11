import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function GroupInfoCard() {
  return (
    <Card className="w-full h-full pb-16 md:pt-10 bg-background border-0">
      <div className="flex flex-col items-center justify-between gap-y-8 px-4 pt-4">
        <h1 className="text-xl font-regular">Group Name</h1>
      </div>
    </Card>
  );
}

