import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

function Wrapper(
  props: HTMLAttributes<HTMLDivElement>,
): React.ReactElement {
  return (
    <div
      {...props}
      className={cn(
        'rounded-xl bg-gradient-to-br from-pink-500 to-blue-500 p-4 prose-no-margin',
        'flex flex-col items-center justify-center',
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

export default Wrapper;