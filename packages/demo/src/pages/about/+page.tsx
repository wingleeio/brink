import { Button } from "$components/ui/button";
import { Label } from "$components/ui/label";
import { Link } from "@brinkjs/core/router";
import { Switch } from "$components/ui/switch";

<div className="p-4 flex flex-col gap-2">
    <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode">I love brink</Label>
    </div>
    <div>
        <Link to="/">
            <Button variant="outline">Go home</Button>
        </Link>
    </div>
</div>;
