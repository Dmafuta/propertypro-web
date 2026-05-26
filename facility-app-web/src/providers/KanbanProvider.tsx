'use client';

import { createContext, Dispatch, PropsWithChildren, use, useCallback, useReducer } from 'react';
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { kanbanBoard, KanbanBoard, Task, TaskList } from 'data/kanban/kanban';
import {
  ACTIONTYPE,
  DRAG_END,
  DRAG_OVER,
  DRAG_START,
  DragItemData,
  kanbanReducer,
} from 'reducers/KanbanReducer';

export interface KanbanState {
  listItems: TaskList[];
  draggedList: TaskList | null;
  draggedTask: Task | null;
  taskDetails: Task | null;
  kanbanBoard: KanbanBoard;
}

const initialState: KanbanState = {
  kanbanBoard: kanbanBoard,
  listItems: kanbanBoard.listItems,
  draggedList: null,
  draggedTask: null,
  taskDetails: null,
};

interface KanbanContextInterface extends KanbanState {
  kanbanDispatch: Dispatch<ACTIONTYPE>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export const KanbanContext = createContext({} as KanbanContextInterface);

const KanbanProvider = ({ children }: PropsWithChildren) => {
  const [state, kanbanDispatch] = useReducer(kanbanReducer, initialState);

  const handleDragStart = (event: DragStartEvent) => {
    kanbanDispatch({
      type: DRAG_START,
      payload: event.active.data.current as DragItemData,
    });
  };

  const handleDragOver = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout | undefined;

      return (event: DragOverEvent) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          kanbanDispatch({
            type: DRAG_OVER,
            payload: {
              activeId: event.active.id as string,
              overId: event.over?.id as string,
              activeRect: event.active.rect.current.translated as DOMRect,
              overRect: event.over?.rect as DOMRect | null,
            },
          });
        }, 16);
      };
    })(),
    [],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    kanbanDispatch({
      type: DRAG_END,
      payload: { activeId: event.active.id as string, overId: event.over?.id as string },
    });
  };

  return (
    <KanbanContext
      value={{ ...state, handleDragStart, handleDragOver, handleDragEnd, kanbanDispatch }}
    >
      {children}
    </KanbanContext>
  );
};

export const useKanbanContext = () => use(KanbanContext);

export default KanbanProvider;
