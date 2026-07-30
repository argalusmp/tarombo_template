'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type FitViewOptions,
  type NodeTypes,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PersonNode, { PERSON_NODE_WIDTH, PERSON_NODE_HEIGHT } from './PersonNode';
import type { PersonNodeData, TaromboPerson } from '@/types/tarombo';

// ============================================================
// TreeCanvas — React Flow wrapper (Phase 2 enhanced)
// ============================================================

const nodeTypes: NodeTypes = { personNode: PersonNode };

const fitViewOptions: FitViewOptions = {
  padding: 0.15,
  maxZoom: 1.2,
};

export interface TreeCanvasHandle {
  fitView: () => void;
  focusOnNode: (id: string) => void;
  getViewportElement: () => HTMLElement | null;
  /** Returns all nodes with positions & dimensions measured by React Flow */
  getNodes: () => Node<PersonNodeData>[];
}

interface TreeCanvasProps {
  nodes: Node<PersonNodeData>[];
  edges: Edge[];
  onNodeSelect?: (person: TaromboPerson) => void;
}

// ─── Inner component (needs ReactFlow context) ──────────────

const TreeCanvasInner = forwardRef<TreeCanvasHandle, TreeCanvasProps>(
  function TreeCanvasInner({ nodes: propNodes, edges: propEdges, onNodeSelect }, ref) {
    const { fitView, getNodes, setCenter, getNode } = useReactFlow();
    const containerRef = useRef<HTMLDivElement>(null);

    const [nodes, setNodes, onNodesChange] = useNodesState<Node<PersonNodeData>>(propNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(propEdges);

    // Sync when props change (new file uploaded or filters/state change)
    useEffect(() => {
      setNodes(propNodes);
    }, [propNodes, setNodes]);

    useEffect(() => {
      setEdges(propEdges);
    }, [propEdges, setEdges]);

    useImperativeHandle(ref, () => ({
      fitView: () => fitView(fitViewOptions),
      focusOnNode: (id: string) => {
        const node = getNode(id);
        if (node) {
          setCenter(
            node.position.x + (node.measured?.width  ?? PERSON_NODE_WIDTH)  / 2,
            node.position.y + (node.measured?.height ?? PERSON_NODE_HEIGHT) / 2,
            { zoom: 1.2, duration: 600 }
          );
        }
      },
      getViewportElement: () =>
        containerRef.current?.querySelector('.react-flow__viewport') as HTMLElement | null,
      getNodes: () => getNodes() as Node<PersonNodeData>[],
    }));

    const handleNodeClick = useCallback<NodeMouseHandler>(
      (_event, node) => {
        const data = node.data as PersonNodeData;
        if (data?.person && onNodeSelect) {
          onNodeSelect(data.person);
        }
      },
      [onNodeSelect]
    );

    const miniMapNodeColor = useCallback((node: Node) => {
      const data = node.data as PersonNodeData | undefined;
      if (data?.isSelected) return '#60a5fa';
      if (data?.isAncestor) return '#f87171';
      if (data?.isDescendant) return '#4ade80';
      if (data?.isFocused) return '#a78bfa';
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={fitViewOptions}
          minZoom={0.02}
          maxZoom={3}
          proOptions={{ hideAttribution: true }}
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
            showInteractive={false}
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

// ─── Outer component wraps with ReactFlowProvider ────────────

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
