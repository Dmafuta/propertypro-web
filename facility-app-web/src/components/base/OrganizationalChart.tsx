import { ReactNode } from 'react';
import { Tree, TreeNode, TreeProps } from 'react-organizational-chart';
import { Box, BoxProps, useTheme } from '@mui/material';

export type OrgNode<T = unknown> = {
  id: string;
  data: T;
  children?: OrgNode<T>[];
};

type OrganizationalChartProps<T> = Omit<TreeProps, 'label' | 'children'> & {
  data: OrgNode<T>;
  renderNode: (node: OrgNode<T>) => ReactNode;

  lineHeight?: string;
  lineWidth?: string;
  lineColor?: string;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  lineBorderRadius?: string;
  sx?: BoxProps['sx'];
};

export function OrganizationalChart<T>({
  data,
  renderNode,
  lineHeight = '24px',
  lineWidth = '2px',
  lineColor,
  lineStyle = 'solid',
  lineBorderRadius = '12px',
  sx,
  ...props
}: OrganizationalChartProps<T>) {
  const { vars } = useTheme();

  const renderTree = (node: OrgNode<T>) => {
    return (
      <TreeNode key={node.id} className="tree-node" label={renderNode(node)}>
        {node.children?.map((child) => renderTree(child))}
      </TreeNode>
    );
  };

  return (
    <Box
      sx={[
        {
          overflowX: 'auto',
          py: 3,
          direction: ({ direction }) => (direction === 'rtl' ? 'rtl' : 'ltr'),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Tree
        lineHeight={lineHeight}
        lineWidth={lineWidth}
        lineColor={lineColor || vars.palette.divider}
        lineStyle={lineStyle}
        lineBorderRadius={lineBorderRadius}
        label={renderNode(data)}
        {...props}
      >
        {data.children?.map((child) => renderTree(child))}
      </Tree>
    </Box>
  );
}
