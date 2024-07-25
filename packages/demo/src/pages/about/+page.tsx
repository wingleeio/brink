import { Button } from "$components/ui/button";
import { Label } from "$components/ui/label";
import { Link } from "@brinkjs/core/router";
import { Switch } from "$components/ui/switch";
import { props } from "./$props";

const { version, message } = props;

<div className="p-4 flex flex-col gap-2">
    <Link className="vt-name-[button]" to="/" unstable_viewTransition>
        <Button variant="outline">Go home</Button>
    </Link>
    <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode">I love brink {version}</Label>
    </div>
    <div>{message}</div>
</div>;
