import * as React from 'react';
import { List, type RowComponentProps } from 'react-window';

const ITEM_SIZE = 35;
const MAX_VISIBLE_ITEMS = 8;

type ListboxProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

type RowProps = { items: React.ReactNode[] };

const Row = ({ index, style, items }: RowComponentProps<RowProps>) => {
  const item = items[index] as React.ReactElement<{ style?: React.CSSProperties }>;
  return React.cloneElement(item, { style: { ...item.props.style, ...style } });
};

const VirtualizedListbox = ({ children, ref, ...other }: ListboxProps) => {
  const items = React.Children.toArray(children);
  const itemCount = items.length;

  const height = Math.min(itemCount, MAX_VISIBLE_ITEMS) * ITEM_SIZE;

  return (
    <div ref={ref} {...other}>
      <div style={{ height }}>
        <List
          rowCount={itemCount}
          rowHeight={ITEM_SIZE}
          rowComponent={Row}
          rowProps={{ items }}
          overscanCount={5}
        />
      </div>
    </div>
  );
};

export default VirtualizedListbox;
