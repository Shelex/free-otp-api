import { consola } from 'consola';

class Lock {
  name: string = 'lock';
  isLocked: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  acquire() {
    if (this.isLocked) {
      consola.warn(`lock ${this.name} already acquired`);
      return;
    }
    consola.info(`lock ${this.name} acquired`);
    this.isLocked = true;
  }

  release() {
    consola.info(`lock ${this.name} released`);
    this.isLocked = false;
  }
}

export const createLock = (name: string) => new Lock(name);
