import { Button } from "$components/ui/button";
import { Link } from "@brinkjs/core/router";
import { props } from "./$props";
import { useState } from "react";

const [count, setCount] = useState(0);

<div className="p-4 flex flex-col gap-2">
    <div className="flex gap-2">
        <Button onClick={() => setCount(count - 1)}>Decrement</Button>
        <div className="px-4 py-2 bg-slate-100 rounded-md">{count}</div>
        <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </div>
    <Link className="vt-name-[button]" to="/about" unstable_viewTransition>
        <Button variant="outline">About</Button>
    </Link>
</div>;
