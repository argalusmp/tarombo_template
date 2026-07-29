'use client';

import React, { useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type Node,
  type Edge,
  type FitViewOptions,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PersonNode from './PersonNode';
import type { PersonNodeData } from '@/types/tarombo';

// ============================================================
// TreeCanvas — React Flow wrapper
// ============================================================

const nodeTypes: NodeTypes = { personNode: PersonNode };

const fitViewOptions: FitViewOptions = {
  padding: 0.15,
  maxZoom: 1.5,
};

export interface TreeCanvasHandle {
  fitView: () => void;
  getViewportElement: () => HTMLElement | null;
}

interface TreeCanvasProps {
  nodes: Node<PersonNodeData>[];
  edges: Edge[];
}

// ─── Inner component (needs ReactFlow context) ──────────────

const TreeCanvasInner = forwardRef<TreeCanvasHandle, TreeCanvasProps>(
  function TreeCanvasInner({ nodes, edges }, ref) {
    const { fitView } = useReactFlow();
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      fitView: () => fitView(fitViewOptions),
      getViewportElement: () =>
        containerRef.current?.querySelector('.react-flow__viewport') as HTMLElement | null,
    }));

    const onNodesChange = useCallback(() => {}, []);
    const onEdgesChange = useCallback(() => {}, []);

    const miniMapNodeColor = useCallback((node: Node) => {
      const data = node.data as PersonNodeData | undefined;
      const gender = data?.person?.gender;
      if (gender === 'L') return '#3b82f6';
      if (gender === 'P') return '#ec4899';
      return '#475569';
    }, []);

    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={fitViewOptions}
          minZoom={0.02}
          maxZoom={3}
          proOptions={{ hideAttribution: true }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            color="#1e293b"
          />

          <Controls
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          />

          <MiniMap
            nodeColor={miniMapNodeColor}
            maskColor="rgba(15, 23, 42, 0.8)"
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 10,
            }}
            pannable
            zoomable
          />
        </ReactFlow>
      </div>
    );
  }
);

TreeCanvasInner.displayName = 'TreeCanvasInner';

// ─── Outer component wraps with ReactFlowProvider ───────────

const TreeCanvas = forwardRef<TreeCanvasHandle, TreeCanvasProps>(
  function TreeCanvas(props, ref) {
    return (
      <ReactFlowProvider>
        <TreeCanvasInner {...props} ref={ref} />
      </ReactFlowProvider>
    );
  }
);

TreeCanvas.displayName = 'TreeCanvas';

export default TreeCanvas;
