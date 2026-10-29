import { draggableTypeKey } from '../../shared/drag-and-drop/types';

export function isTask(data: any): boolean {
  return draggableTypeKey in data && data[draggableTypeKey] === 'task';
}

export function isList(data: any): boolean {
  return draggableTypeKey in data && data[draggableTypeKey] === 'list';
}
