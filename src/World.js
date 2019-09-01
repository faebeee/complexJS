import System from './System';
import Entity from './Entity';
import Manager from './Manager';
import EntitySystem from './System/EntitySystem';
import VoidSystem from './System/VoidSystem';
import isInstanceOf from './utils/isInstanceOf';

/**
 * The world contains all entities, systems and managers
 */
class World {
    constructor() {
        /** @var {Entity[]}*/
        this.entities = [];

        /** @var {VoidSystem[]} */
        this.voidSystems = [];

        /** @var {EntitySystem[]} */
        this.entitySystems = [];

        /** @var {Manager[]} */
        this.managers = [];

        /** @var { boolean}  */
        this.initialized = false;
    }

    /**
     * Add entity to the world
     * @param { Entity} entity
     */
    addEntity(entity) {
        let slot = this.getFreeEntitySlot();
        entity.setWorld(this);

        if (slot != null) {
            this.entities[slot] = entity;
        } else {
            slot = this.entities.length;
            this.entities.push(entity);
        }

        entity.setIndex(slot);
        this.entityAdded(entity);
    }

    /**
     * remove entity from the world
     * @param {Entity} entity
     */
    removeEntity(entity) {
        const index = entity.getIndex();
        if (index === null) {
            throw new Error('Entity has no index');
        }

        this.entityDeleted(entity);
        delete this.entities[index];
    }

    /**
     * Get entity from world by its id
     * @param {number} index
     * @returns {Entity}
     */
    getEntity(index) {
        if (this.entities[index] == undefined) {
            throw new Error('No entity found');
        }
        return this.entities[index];
    }

    /**
     * Get all entities from wold
     * @returns {Entity[]}
     */
    getEntities() {
        let entities = [];
        for (let e = 0, len = this.entities.length; e < len; e++) {
            let entity = this.entities[e];
            if (entity == undefined || entity == null) {
                continue;
            }
            entities.push(entity);
        }
        return entities;
    }

    /**
     * Add a System to world
     * @param { EntitySystem | VoidSystem} system
     */
    addSystem(system) {
        system.setWorld(this);

        if (system instanceof EntitySystem === true) {
            let slot = this.getFreeEntitySystemSlot();
            if (slot != null) {
                this.entitySystems[slot] = system;
            } else {
                this.entitySystems.push(system);
            }
        } else if (system instanceof VoidSystem === true) {
            let slot = this.getFreeEntitySystemSlot();
            if (slot != null) {
                this.voidSystems[slot] = system;
            } else {
                this.voidSystems.push(system);
            }
        }
    }

    /**
     * After all systems has been added, this should be called to initiate them
     */
    init() {
        for (let i = 0, len = this.entitySystems.length; i < len; i++) {
            let system = this.entitySystems[i];
            system.addedToWorld();
        }

        for (let i = 0, len = this.voidSystems.length; i < len; i++) {
            let system = this.voidSystems[i];
            system.addedToWorld();
        }

        this.initialized = true;
    }

    /**
     * get a System
     * @param  {string | System} systemClass
     * @return {System}
     */
    getSystem(systemClass) {
        for (let i = 0, len = this.entitySystems.length; i < len; i++) {
            let s = this.entitySystems[i];
            if (s instanceof systemClass) {
                return s;
            }
        }

        for (let i = 0, len = this.voidSystems.length; i < len; i++) {
            let s = this.voidSystems[i];
            if (s instanceof systemClass) {
                return s;
            }
        }

        throw 'System ' + systemClass + ' not found';
    }

    /**
     * Remove System
     * @param {Function} systemClass
     */
    removeSystem(systemClass) {
        for (let i = 0, len = this.entitySystems.length; i < len; i++) {
            let s = this.entitySystems[i];
            if (s === undefined) {
                continue;
            }

            if (s instanceof systemClass) {
                delete this.entitySystems[i];
            }
        }

        for (let i = 0, len = this.voidSystems.length; i < len; i++) {
            let s = this.voidSystems[i];
            if (s === undefined) {
                continue;
            }
            if (s instanceof systemClass) {
                delete this.voidSystems[i];
            }
        }
    }

    /**
     * Add Manager
     * @param{Manager} manager
     */
    addManager(manager) {
        manager.setWorld(this);
        this.managers.push(manager);
    }

    /**
     * Get a manager
     * @param { Function} managerClass
     * @returns {Manager}
     */
    getManager(managerClass) {
        for (let i = 0, len = this.managers.length; i < len; i++) {
            let manager = this.managers[i];
            if (manager instanceof managerClass) {
                return this.managers[i];
            }
        }

        throw 'Manager ' + name + ' not found';
    }

    /**
     * Update the world
     */
    update() {
        if (this.initialized === false) {
            throw new Error('Not initialized');
        }

        this.updateEntities();
        this.updateVoidSystem();
        this.updateEntitySystem();
    }

    /**
     * Update void systems
     */
    updateVoidSystem() {
        for (let s = 0, sLen = this.voidSystems.length; s < sLen; s++) {
            let system = this.voidSystems[s];
            system.update();
        }
    }

    /**
     * Update entity systems
     */
    updateEntitySystem() {
        for (let s = 0, sLen = this.entitySystems.length; s < sLen; s++) {
            const system = this.entitySystems[s];
            const entities = this.getEntitiesForSystem(system);
            system.processEntities(entities);
        }
    }

    /**
     * Get all entities that fit a systems requirements(components)
     * @param {EntitySystem} system
     * @returns {Entity[]}
     */
    getEntitiesForSystem(system) {
        const components = system.getComponents();
        const entities = [];
        for (let i = 0; i < components.length; i++) {
            entities.push(...this.getEntitiesWithComponent(components[i]));
        }
        return entities;
    }

    /**
     * Get a list of entities that match a component
     * @param {Function} component
     * @returns {Entity[]}
     */
    getEntitiesWithComponent(component) {
        const entities = this.entities;
        const entitiesLength = entities.length;
        const filteredComponents = [];

        for (let i = 0; i < entitiesLength; i++) {
            const entity = entities[i];
            if (entity.hasComponent(component)) {
                filteredComponents.push(entity);
            }
        }

        return filteredComponents;
    }

    /**
     * Update all entities state
     */
    updateEntities() {
        const entities = this.entities;
        const entitiesLength = entities.length;

        for (let i = 0; i < entitiesLength; i++) {
            const entity = entities[i];

            if (!entity.isAlive() && entity.isRemove()) {
                this.removeEntity(entity);
            }
        }
    }

    /**
     * recycle entityslots
     * @returns {number | null}
     */
    getFreeEntitySlot() {
        for (let e = 0, len = this.entities.length; e < len; e++) {
            let entity = this.entities[e];
            if (entity == null || entity == undefined) {
                return e;
            }
        }
        return null;
    }

    /**
     * recycle systemslot
     * @return {number | null}
     */
    getFreeEntitySystemSlot() {
        for (let s = 0, len = this.entitySystems.length; s < len; s++) {
            let system = this.entitySystems[s];
            if (system == undefined || system == null) {
                return s;
            }
        }
        return null;
    }

    /**
     * notify systems for new entity
     * @param {Entity} entity
     * @protected
     */
    entityAdded(entity) {
        for (let s = 0, len = this.voidSystems.length; s < len; s++) {
            let system = this.voidSystems[s];
            system.added(entity);
        }

        for (let s = 0, len = this.entitySystems.length; s < len; s++) {
            let system = this.entitySystems[s];
            system.added(entity);
        }
    }

    /**
     * notify systems for deleted entity
     * @param {Entity} entity
     * @protected
     */
    entityDeleted(entity) {
        for (let s = 0, len = this.voidSystems.length; s < len; s++) {
            let system = this.voidSystems[s];
            system.removed(entity);
        }

        for (let s = 0, len = this.entitySystems.length; s < len; s++) {
            let system = this.entitySystems[s];
            system.removed(entity);
        }
    }

    /**
     * @return {EntitySystem[]}
     */
    getEntitySystems() {
        return this.entitySystems;
    }

    /**
     * @returns {VoidSystem[]}
     */
    getVoidSystems() {
        return this.voidSystems;
    }

    /**
     * @return {Manager[]}
     */
    getManagers() {
        return this.managers;
    }
}

export default World;
