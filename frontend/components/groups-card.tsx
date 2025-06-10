import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function GroupsCard() {
  return (
    <Card className="w-full h-full bg-background flex flex-col">
      <div className="flex items-center justify-center">
        <h1 className="text-xl font-regular">Groups (20)</h1>
      </div>
      <div className="flex flex-col items-center justify-between p-4 flex-1">
        {/* Your group content here */}
      </div>
    </Card>
  );
}

