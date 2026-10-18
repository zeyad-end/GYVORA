import type {Workout} from './store';
export function copyProgram(original:Workout):Workout {const copy=structuredClone(original);copy.id=crypto.randomUUID();return copy;}