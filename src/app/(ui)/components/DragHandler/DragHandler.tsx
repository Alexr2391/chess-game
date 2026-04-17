interface DragHandlerProps {
  isDragging: boolean;
  onDragMove: (position: [number, number, number]) => void;
}

export const DragHandler = ({ isDragging, onDragMove }: DragHandlerProps) => {
  return (
    <mesh
      visible={false}
      onPointerMove={(e) => {
        if (!isDragging) return;
        onDragMove([e.point.x, e.point.y, e.point.z]);
      }}
    >
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
};
