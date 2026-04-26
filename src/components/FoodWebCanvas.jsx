import { useCallback, useMemo, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import SpeciesNode from './SpeciesNode';
import { useStore } from '../store/useStore';

const nodeTypes = { speciesNode: SpeciesNode };

export default function FoodWebCanvas({ onNodeSelect, onEdgeSelect, onEdgeDeleteRequest }) {
  const species = useStore((s) => s.species);
  const links = useStore((s) => s.links);
  const addLink = useStore((s) => s.addLink);
  const removeSpecies = useStore((s) => s.removeSpecies);
  const updateSpecies = useStore((s) => s.updateSpecies);
  const mode = useStore((s) => s.mode);
  const currentTool = useStore((s) => s.currentTool);
  const world = useStore((s) => s.world);
  const simTick = useStore((s) => s.simTick);

  // 获取实时生物量映射表
  const liveBMap = useMemo(() => {
    if (mode === 'run' && world) {
      const map = {};
      world.species.forEach((s) => { map[s.id] = s.B; });
      return map;
    }
    return null;
  }, [mode, world, simTick]);

  const initialNodes = useMemo(() => {
    return species.map((s) => ({
      id: s.id,
      type: 'speciesNode',
      position: s.position || { x: Math.random() * 400, y: Math.random() * 300 },
      data: {
        name: s.name,
        type: s.type,
        B: liveBMap ? (liveBMap[s.id] ?? s.B) : s.B,
        w: s.w || 0,
        isExtinct: (liveBMap ? (liveBMap[s.id] ?? s.B) : s.B) <= 0,
        onRemove: () => removeSpecies(s.id),
      },
    }));
  }, [species, removeSpecies, liveBMap]);

  const initialEdges = useMemo(() => {
    return links.map((l) => ({
      id: l.id,
      source: l.source,
      target: l.target,
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      style: { stroke: '#888', strokeWidth: 2 },
    }));
  }, [links]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const onNodeDragStop = useCallback(
    (event, node) => {
      updateSpecies(node.id, { position: node.position });
    },
    [updateSpecies]
  );

  const connectingFrom = useRef(null);
  const onNodeClick = useCallback(
    (event, node) => {
      if (mode !== 'edit') return;
      if (currentTool === 'arrow') {
        if (!connectingFrom.current) {
          connectingFrom.current = node.id;
        } else {
          if (connectingFrom.current !== node.id) {
            addLink(connectingFrom.current, node.id);
          }
          connectingFrom.current = null;
        }
      } else if (currentTool === 'edit') {
        onNodeSelect?.(node.id);
      }
    },
    [mode, currentTool, addLink, onNodeSelect]
  );

  const onEdgeClick = useCallback(
    (event, edge) => {
      if (mode !== 'edit') return;
      if (currentTool === 'arrow') {
        onEdgeDeleteRequest?.(edge.id);
      } else if (currentTool === 'edit') {
        onEdgeSelect?.(edge.id);
      }
    },
    [mode, currentTool, onEdgeDeleteRequest, onEdgeSelect]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStop={onNodeDragStop}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onConnect={() => {}}
      nodeTypes={nodeTypes}
      fitView
      deleteKeyCode={[]}
      nodesDraggable={mode === 'edit'}
      nodesConnectable={false}
      elementsSelectable={mode === 'edit'}
      edgesReconnectable={false}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}