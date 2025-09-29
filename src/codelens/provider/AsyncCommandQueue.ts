export class AsyncCommandQueue {
    private queue: (() => Promise<void>)[];
    private isRunning;
    constructor() {
        this.queue = [];
        this.isRunning = false;
    }

    private async runNext():Promise<void> {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;

        const nextTask = this.queue.shift();
        if (!nextTask) {
            this.isRunning = false;
            return;
        }

        try {
            await nextTask();
        } catch (e) {
            console.error('Error running queued task:', e);
        }

        this.isRunning = false;
        this.runNext();
    }

    public enqueue(task: () => Promise<void>) {
        this.queue.push(task);
        this.runNext();
    }
}