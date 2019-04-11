import { System } from '../System';
import Entity from '../Entity';
import World from '../World';
/**
 * This System only renders once per update and is decoupled from the entities. This can be used to
 * update some data or clear the canvas on the screen
 */
export default abstract class VoidSystem implements System {
    protected world: World | null;
    /**
     * update System
     */
    abstract update(): void;
    added(entity: Entity): void;
    addedToWorld(): void;
    removed(entity: Entity): void;
    setWorld(world: World): void;
}
