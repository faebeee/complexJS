import Component from './Component';

/**
 * An entity is a object that holds many components. Those components define the behaviour of an entity.
 */
class Entity {

    /**
     *
     * @param {string} name
     */
    constructor(name = 'Entity') {
        /** @var {string} */
        this.name = name;

        /** @var { Component[]} */
        this.components = [];

        /** @var {boolean} */
        this.alive = true;

        /** @var {boolean} */
        this.remove = false;

        /** @var {number | null} */
        this.index = null;

        this.listeners = [];
    }

    /**
     * Add a Component to the entity
     * @param {Component} component
     * @returns {Entity}
     */
    addComponent(component) {
        let slot = this._getFreeSlot();
        if (slot != null) {
            this.components[slot] = component;
        } else {
            this.components.push(component);
        }

        return this;
    }

    /**
     * Add eventlistener to entity
     * @param {string} event
     * @param {function} callback
     * @returns {Entity}
     */
    addListener(event, callback) {
        this.listeners.push({ event, callback });

        return this;
    }

    /**
     * Remove event listener
     * @param {string} event
     * @returns {Entity}
     */
    removeListener(event) {
        this.listeners = this.listeners.filter((listener) => {
            return !(listener.event === event);
        });

        return this;
    }

    /**
     * Emit event with data
     * @param {string} event
     * @param {object} data
     * @returns {Entity}
     */
    emit(event, data) {
        this.listeners.filter((listener) => {
            return (listener.event === event);
        })
            .map((listener) => {
                listener.callback(data);
            });

        return this;
    }

    /**
     * Get all mathing components
     * @param {Function} component component constructor
     * @return {Component[]}
     */
    getComponents(component) {
        let components = [];
        for (let i = 0, len = this.components.length; i < len; i++) {
            let c = this.components[i];
            if (c instanceof component) {
                components.push(c);
            }
        }
        return components;
    }

    /**
     * Get a Component from the entity
     * @param {Function} component component constructor
     * @return {Component}
     * @throws Error
     */
    getComponent(component) {
        for (let i = 0, len = this.components.length; i < len; i++) {
            let c = this.components[i];
            if (c instanceof component) {
                return c
            }
        }
        throw new Error('Component not found');
    }

    /**
     * Get a Component from the entity by its tag name
     * @param {Function} component
     * @returns {boolean}
     */
    hasComponent(component) {
        for (let i = 0, len = this.components.length; i < len; i++) {
            let c = this.components[i];
            if (c instanceof component) {
                return true;
            }
        }
        return false;
    }

    /**
     * remove a Component from the entity
     * @param {Function} component
     * @returns {Entity}
     */
    removeComponent(component) {
        this.components = this.components.filter(entry => {
            return !(entry instanceof component);
        });

        return this;
    }

    /**
     * Get all components from the entity
     * @returns { Component[]}
     */
    getAllComponents() {
        return this.components;
    }

    /**
     * Reuses old Component slots in the array
     * @return {number | null}
     * @private
     */
    _getFreeSlot() {
        for (let c = 0, len = this.components.length; c < len; c++) {
            let component = this.components[c];
            if (component == undefined || component == null) {
                return c;
            }
        }
        return null;
    }

    /**
     * Kills the entity
     */
    destroy() {
        this.alive = false;
        this.remove = true;
    }

    /**
     * Set index value of entity
     * @param {number} index
     */
    setIndex(index) {
        this.index = index;
    }

    /**
     * Get index of entity
     * @returns {number | null}
     */
    getIndex() {
        return this.index;
    }

    /**
     * Check if entity is alive
     * @returns {boolean}
     */
    isAlive() {
        return this.alive;
    }

    /**
     * Check if entity should be removed in next cycle
     * @returns {boolean}
     */
    isRemove() {
        return this.remove;
    }
}

export default Entity;
