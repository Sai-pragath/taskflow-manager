import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getTasks, updateTaskStatus, createTask, deleteTask, getUsers } from '../api/index.js';
import { useToast } from '../context/ToastContext.jsx';
import { useActivity } from '../context/ActivityContext.jsx';
import TaskCard from './TaskCard.jsx';
import TaskDetailModal from './TaskDetailModal.jsx';
import './KanbanBoard.css';

const COLUMNS = [
  { id: 'TODO', label: 'To Do', icon: '📋', color: '#6c63ff' },
  { id: 'IN_PROGRESS', label: 'In Progress', icon: '🔄', color: '#3b82f6' },
  { id: 'REVIEW', label: 'Review', icon: '👀', color: '#ffb347' },
  { id: 'DONE', label: 'Done', icon: '✅', color: '#00d4aa' },
];

export default function KanbanBoard({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', assigneeId: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]);
  const { toast } = useToast();
  const { logActivity } = useActivity();

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await getTasks(projectId);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
    getUsers().then(res => setUsers(res.data)).catch(console.error);

    // WebSocket for real-time updates
    let client;
    try {
      client = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe(`/topic/tasks/${projectId}`, (message) => {
            const updatedTask = JSON.parse(message.body);
            setTasks((prev) => {
              const exists = prev.find((t) => t.id === updatedTask.id);
              if (exists) {
                return prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
              }
              return [...prev, updatedTask];
            });
          });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message']);
        },
      });
      client.activate();
    } catch (err) {
      console.warn('WebSocket connection failed, using polling:', err);
    }

    return () => {
      if (client) client.deactivate();
    };
  }, [projectId, fetchTasks]);

  // Drag handler
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTaskStatus(draggableId, newStatus);
      const task = tasks.find((t) => t.id === draggableId);
      logActivity('task_moved', { title: task?.title, status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to move task');
      fetchTasks(); // Revert on error
    }
  };

  // Create task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await createTask({
        ...newTask,
        projectId,
      });
      logActivity('task_created', { title: newTask.title, projectId });
      toast.success(`Task "${newTask.title}" created`);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', assigneeId: '' });
      setShowNewTask(false);
      fetchTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
      toast.error('Failed to create task');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteTask(taskId);
      logActivity('task_deleted', { title: task?.title });
      toast.success('Task deleted');
    } catch (err) {
      console.error('Failed to delete task:', err);
      toast.error('Failed to delete task');
      fetchTasks();
    }
  };

  if (loading) {
    return (
      <div className="kanban-loading">
        {COLUMNS.map((col) => (
          <div key={col.id} className="kanban-col-skeleton">
            <div className="skeleton" style={{ height: 24, width: 120, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 100, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 80, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 60 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="kanban-wrapper">
      {/* Toolbar */}
      <div className="kanban-toolbar">
        <div className="kanban-task-count">
          {tasks.length} task{tasks.length !== 1 && 's'}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowNewTask(true)}
          id="new-task-btn"
        >
          + New Task
        </button>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board" id="kanban-board">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided, snapshot) => (
                  <div
                    className={`kanban-column ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    id={`column-${col.id}`}
                  >
                    {/* Column header */}
                    <div className="kanban-col-header">
                      <span className="kanban-col-icon">{col.icon}</span>
                      <span className="kanban-col-label">{col.label}</span>
                      <span className="kanban-col-count" style={{ background: `${col.color}22`, color: col.color }}>
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Accent line */}
                    <div className="kanban-col-accent" style={{ background: col.color }} />

                    {/* Cards */}
                    <div className="kanban-col-cards">
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <TaskCard
                              task={task}
                              provided={provided}
                              onDelete={handleDeleteTask}
                              onOpen={(t) => setSelectedTask(t)}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {colTasks.length === 0 && (
                        <div className="kanban-empty">
                          <span>No tasks</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="modal-overlay" onClick={() => setShowNewTask(false)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  autoFocus
                  id="new-task-title"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  className="input-field"
                  placeholder="Add more details..."
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                  id="new-task-desc"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Priority</label>
                <select
                  className="select-field"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  id="new-task-priority"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Assignee</label>
                <select
                  className="select-field"
                  value={newTask.assigneeId}
                  onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowNewTask(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="submit-new-task">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={fetchTasks}
        />
      )}
    </div>
  );
}
